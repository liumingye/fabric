import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { KeybindingService, IKeybindingService } from '@/core/keybinding/keybindingService'
import { useFabricSwipe } from '@/hooks/useFabricSwipe'
import { Ellipse, Point, Rect, Triangle, Textbox, FabricObject } from '@fabric'
import { useAppStore } from '@/store'
import { useMagicKeys, useActiveElement, toValue } from '@vueuse/core'
import { Disposable } from '@/utils/lifecycle'

export class FabricTool extends Disposable {
  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService private readonly keybinding: KeybindingService,
  ) {
    super()
    this.initWatch()
    this.initHandMove()
    this.initKeybinding()
  }

  private initWatch() {
    const canvas = this.canvas
    const { activeTool } = storeToRefs(useAppStore())
    // 监听activeTool
    let swipeStop: (() => void) | undefined
    let tempObject: Ellipse | Rect | Triangle | Textbox | undefined
    watch(activeTool, (tool, oldTool) => {
      if (swipeStop) {
        swipeStop()
        swipeStop = undefined
        tempObject = undefined
      }

      if (oldTool === 'handMove') {
        this.handMoveActivate = false
      }

      // 选择工具
      if (tool === 'move') {
        canvas.defaultCursor = 'default'
        canvas.setCursor('default')
        canvas.skipTargetFind = false
        canvas.selection = true
      }
      // 移动工具
      else if (tool === 'handMove') {
        this.handMoveActivate = true
      }
      // 图形工具
      else if (['rect', 'ellipse', 'triangle', 'text'].includes(tool)) {
        canvas.defaultCursor = 'crosshair'
        canvas.setCursor('crosshair')
        canvas.skipTargetFind = true
        canvas.selection = false
        const { min, max, abs, ceil } = Math
        let startLeft: number
        let startTop: number
        const { stop, lengthX, lengthY } = useFabricSwipe({
          onSwipeStart(e) {
            if (e.button !== 1) return
            const { x, y } = canvas.getPointer(e.e)
            startLeft = ceil(x)
            startTop = ceil(y)
            switch (tool as 'rect' | 'ellipse' | 'triangle' | 'text') {
              case 'rect':
                tempObject = new Rect({
                  left: startLeft,
                  top: startTop,
                  width: 1,
                  height: 1,
                })
                break
              case 'ellipse':
                tempObject = new Ellipse({
                  left: startLeft,
                  top: startTop,
                  width: 1,
                  height: 1,
                  rx: 0.5,
                  ry: 0.5,
                })
                break
              case 'triangle':
                tempObject = new Triangle({
                  left: startLeft,
                  top: startTop,
                  width: 1,
                  height: 1,
                })
                break
              case 'text':
                tempObject = new Textbox('', {
                  left: startLeft,
                  top: startTop,
                  width: 1,
                  height: 1,
                  splitByGrapheme: true,
                })
                break
            }
            tempObject.set('noEventObjectAdded', true)
            canvas.add(tempObject)
            tempObject.set('noEventObjectAdded', false)
            canvas.setActiveObject(tempObject)
          },
          onSwipe() {
            requestAnimationFrame(() => {
              const zoom = canvas.getZoom()
              const _lengthX = lengthX.value / zoom
              const _lengthY = lengthY.value / zoom
              if (!tempObject) return
              let opt: Partial<FabricObject & Ellipse> = {
                left: abs(min(startLeft, startLeft + _lengthX)),
                top: abs(min(startTop, startTop + _lengthY)),
                width: abs(max(ceil(_lengthX)), 1),
                height: abs(max(ceil(_lengthY)), 1),
              }
              tempObject.set({})
              if (tool === 'ellipse') {
                opt = {
                  ...opt,
                  rx: max(abs(ceil(_lengthX)) / 2, 0.5),
                  ry: max(abs(ceil(_lengthY)) / 2, 0.5),
                }
              }
              tempObject.set(opt)
              canvas.renderAll()
            })
          },
          onSwipeEnd() {
            if (tempObject) {
              if (tempObject.width <= 1 && tempObject.height <= 1) {
                tempObject.set({
                  left: tempObject.left - 50,
                  top: tempObject.top - 50,
                  width: 100,
                  height: 100,
                })
                if (tool === 'ellipse') {
                  tempObject.set({
                    rx: 50,
                    ry: 50,
                  })
                }
                canvas.requestRenderAll()
              }
              if (tempObject.group) {
                tempObject.group._onObjectAdded(tempObject)
              } else {
                canvas._onObjectAdded(tempObject)
              }
            }
            tempObject = undefined
            activeTool.value = 'move'
          },
        })
        swipeStop = stop
      }
    })
  }

  private _handMoveActivate = false

  private get handMoveActivate() {
    return this._handMoveActivate
  }

  private set handMoveActivate(value) {
    this._handMoveActivate = value
    if (value) {
      this.canvas.defaultCursor = 'grab'
      this.canvas.setCursor('grab')
      this.canvas.skipTargetFind = true
      this.canvas.selection = false
    } else {
      this.canvas.defaultCursor = 'default'
      this.canvas.setCursor('default')
      this.canvas.skipTargetFind = false
      this.canvas.selection = true
    }
  }

  private initHandMove() {
    const canvas = this.canvas
    const { space } = useMagicKeys()
    const { activeTool } = storeToRefs(useAppStore())
    // 鼠标中键拖动视窗
    let vpt = canvas.viewportTransform
    let mouseDown = false
    const { lengthX, lengthY } = useFabricSwipe({
      onSwipeStart: (e) => {
        vpt = canvas.viewportTransform
        if (e.button === 2 && activeTool.value !== 'handMove') {
          this.handMoveActivate = true
          canvas.setCursor('grabbing')
        }
        mouseDown = true
      },
      onSwipe: () => {
        if (this.handMoveActivate && mouseDown) {
          canvas.setCursor('grabbing')
          const deltaPoint = new Point(lengthX.value, lengthY.value)
            .scalarDivide(canvas.getZoom())
            .transform(vpt)
            .scalarMultiply(-1)
          canvas.absolutePan(deltaPoint)
        }
      },
      onSwipeEnd: () => {
        if (this.handMoveActivate && mouseDown) {
          canvas.setCursor(canvas.defaultCursor)
        }
        if (activeTool.value !== 'handMove' && !space.value) {
          this.handMoveActivate = false
        }
        mouseDown = false
      },
    })

    // 空格键切换移动工具
    const activeElement = useActiveElement()
    const notUsingInput = computed(
      () => activeElement.value?.tagName !== 'INPUT' && activeElement.value?.tagName !== 'TEXTAREA',
    )
    watch(
      computed(() => [space.value, notUsingInput.value].every((i) => toValue(i))),
      (value) => {
        this.handMoveActivate = value
      },
    )
  }

  private initKeybinding() {
    // 快捷键
    const { activeTool } = storeToRefs(useAppStore())
    this.keybinding.bind('v', () => (activeTool.value = 'move'))
    this.keybinding.bind('h', () => (activeTool.value = 'handMove'))
    this.keybinding.bind('r', () => (activeTool.value = 'rect'))
    this.keybinding.bind('o', () => (activeTool.value = 'ellipse'))
  }
}
