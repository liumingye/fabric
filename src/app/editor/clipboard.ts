import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { Disposable } from '@/utils/lifecycle'
import { IKeybindingService, KeybindingService } from '@/core/keybinding/keybindingService'
import { ClipboardService, IClipboardService } from '@/core/clipboard/clipboardService'
import { encode, decode } from '@/utils/steganography'
import {
  ActiveSelection,
  CanvasEvents,
  FabricObject,
  Point,
  Rect,
  Textbox,
  util,
  Pattern,
} from '@fabric'
import { randomText } from '@/utils/strings'
import { IUndoRedoService, UndoRedoService } from '@/app/editor/undoRedo/undoRedoService'
import { clamp, clone } from 'lodash'
import { appInstance } from '@/app'

export class Clipboard extends Disposable {
  private canvasEvents

  private pointer = new Point()

  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService readonly keybinding: KeybindingService,
    @IClipboardService private readonly clipboard: ClipboardService,
    @IUndoRedoService private readonly undoRedo: UndoRedoService,
  ) {
    super()

    keybinding.bind({
      'mod+x': this.clip.bind(this),
      'mod+c': this.copy.bind(this),
      'mod+v': this.paste.bind(this, false),
      'mod+shift+v': this.paste.bind(this, true),
    })

    this.canvasEvents = {
      'mouse:move': this.updatePointer.bind(this),
    }

    canvas.on(this.canvasEvents)
  }

  private updatePointer(e: CanvasEvents['mouse:move']) {
    this.pointer = e.pointer
  }

  private async copy() {
    const _activeObject = this.canvas.getActiveObject()
    if (!_activeObject) return

    const activeObject = clone(_activeObject)

    const canvas = activeObject.toCanvasElement()

    // 一个元素且是组内元素，退出组，为了获取正确的xy值
    const parent = activeObject.getParent(true)
    if (parent) {
      parent?.exitGroup(activeObject)
    }

    // 转json
    const json = JSON.stringify(activeObject.toObject())

    // 图片写入json
    const ctx = await encode(canvas, json)
    if (!ctx) return

    // 写剪贴板
    const blob = this.dataURLtoBlob(ctx.canvas.toDataURL())
    blob && this.clipboard.writeBlob(blob)
  }

  private async readText(blob: Blob) {
    const text = await blob.text()
    if (!text) return

    const center = this.canvas.getVpCenter()

    const textbox = new Textbox(text, {
      width: 550,
    })

    textbox.width = clamp(textbox.calcTextWidth(), 50, 500)
    textbox.height = textbox.calcTextHeight()
    textbox.left = center.x - textbox.width / 2
    textbox.top = center.y - textbox.height / 2

    this.canvas.add(textbox)
  }

  private async readImage(blob: Blob) {
    const center = this.canvas.getVpCenter()
    util.loadImage(URL.createObjectURL(blob)).then((img) => {
      this.canvas.add(
        new Rect({
          width: img.width,
          height: img.height,
          left: center.x - img.width / 2,
          top: center.y - img.height / 2,
          fill: new Pattern({
            source: img,
          }),
        }),
      )
    })
  }

  private paste(currentLocation = false) {
    this.clipboard.readBlob().then((blobs) => {
      if (!blobs) return
      blobs.forEach(async (blob) => {
        // 文本格式
        if (blob.type === 'text/plain') {
          this.readText(blob)
          return
        }

        // 读取json
        const deJson = await decode(blob)

        let serialized: any | undefined

        if (deJson) {
          try {
            serialized = JSON.parse(deJson)
          } catch (error) {
            //
          }
        }

        // 无json
        if (!serialized) {
          // 图片格式
          if (['image/png', 'image/jpeg'].includes(blob.type)) {
            this.readImage(blob)
          }
          return
        }

        // 如果元素不在画板可视范围内，粘贴元素到中心点
        let pasteCenterPoint = true

        // 递归设置id
        const setAttr = (target: FabricObject[]) => {
          target.forEach((obj) => {
            // 检查元素是否在可视范围
            if (pasteCenterPoint) {
              obj.set('canvas', this.canvas)
              obj.isOnScreen() && (pasteCenterPoint = false)
              obj.set('canvas', undefined)
            }

            obj.id = randomText()
            if (util.isCollection(obj)) {
              setAttr(obj._objects)
            }
          })
        }

        // 插入元素到画板或组内
        const addObjects = (objects: FabricObject[]) => {
          const activeObject = this.canvas.getActiveObject()
          const addTarget =
            util.isCollection(activeObject) && !(activeObject instanceof ActiveSelection)
              ? activeObject
              : this.canvas
          addTarget.add(...objects)
        }

        util
          .enlivenObjects([serialized], {
            reviver: (json, object) => {
              // 设置新的id
              if (util.isCollection(object)) {
                setAttr(object._objects)
              }
              setAttr([object])
            },
          })
          .then((enlived) => {
            const objects = enlived.flatMap((object) => {
              // 粘贴到当前位置
              if (currentLocation) {
                const { x, y } = appInstance.editor.contextMenu?.pointer || this.pointer
                object.left = x
                object.top = y
              }
              // 粘贴到中心点
              else if (pasteCenterPoint) {
                const { x, y } = object.translateToOriginPoint(
                  this.canvas.getVpCenter(),
                  'left',
                  'top',
                )
                object.left = x
                object.top = y
              }

              // ActiveSelection的元素，退出组
              if (object instanceof ActiveSelection) {
                return object.removeAll().reverse() as FabricObject[]
              } else {
                return [object]
              }
            })

            currentLocation && (appInstance.editor.contextMenu!.pointer = undefined)

            addObjects(objects)
            this.canvas.setActiveObjects(objects)

            this.canvas.requestRenderAll()
            this.undoRedo.saveState()
          })
      })
    })
  }

  private clip() {
    this.copy()
    this.keybinding.trigger('del')
  }

  private dataURLtoBlob(dataurl: string) {
    const arr = dataurl.split(',')
    if (!arr || arr.length < 1) return
    const _mime = arr[0].match(/:(.*?);/)
    if (!_mime || _mime.length < 2) return
    const mime = _mime[1]
    const bstr = window.atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  public dispose(): void {
    super.dispose()
    this.keybinding.unbind(['mod+x', 'mod+c', 'mod+v', 'mod+shift+v'])
    this.canvas.off(this.canvasEvents)
  }
}
