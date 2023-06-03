import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { Disposable } from '@/utils/lifecycle'
import { IKeybindingService, KeybindingService } from '@/core/keybinding/keybindingService'
import { ClipboardService, IClipboardService } from '@/core/clipboard/clipboardService'
import { encode, decode } from '@/utils/steganography'
import { ActiveSelection, FabricObject, Group, Image, Textbox, util } from '@fabric'
import { randomText } from '@/utils/strings'
import { IUndoRedoService, UndoRedo } from '@/app/editor/undoRedo/undoRedoService'
import { clamp, clone } from 'lodash'

export class Clipboard extends Disposable {
  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService readonly keybinding: KeybindingService,
    @IClipboardService private readonly clipboard: ClipboardService,
    @IUndoRedoService private readonly undoRedo: UndoRedo,
  ) {
    super()
    keybinding.bind({
      'mod+x': this.clip.bind(this),
      'mod+c': this.copy.bind(this),
      'mod+v': this.paste.bind(this),
    })
  }

  private async copy() {
    let activeObject = this.canvas.getActiveObject()
    if (!activeObject) return
    const canvas = activeObject.toCanvasElement()

    // 一个元素且是组内元素，退出组，为了获取正确的xy值
    if (!util.isCollection(activeObject) && activeObject.group) {
      activeObject = clone(activeObject)
      const parent = activeObject.getParent() as Group
      parent.exitGroup(activeObject)
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
    const img = new window.Image()

    img.onload = () => {
      const image = new Image(img, {
        width: img.width,
        height: img.height,
        left: center.x - img.width / 2,
        top: center.y - img.height / 2,
      })
      this.canvas.add(image)
    }

    img.src = URL.createObjectURL(blob)
  }

  private paste() {
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

        // 递归设置id
        const setId = (target: FabricObject[]) => {
          target.forEach((obj) => {
            obj.id = randomText()
            if (util.isCollection(obj)) {
              setId(obj._objects)
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
                setId(object._objects)
              }
              setId([object])
            },
          })
          .then((enlived) => {
            const objects = enlived.flatMap((object) => {
              // ActiveSelection的元素，退出组
              if (object instanceof ActiveSelection) {
                return object.removeAll().reverse() as FabricObject[]
              } else {
                return [object]
              }
            })

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
}
