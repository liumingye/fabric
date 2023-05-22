import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { KeybindingService, IKeybindingService } from '@/core/keybinding/keybindingService'
import { useFabricSwipe } from '@/hooks/useFabricSwipe'
import { Ellipse, FabricObject, Point, Rect, Triangle, IText, Textbox } from '@fabric'
import { useAppStore } from '@/store'
import { EditTool } from 'app'
import { useMagicKeys } from '@vueuse/core'
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
      // 移动工具关闭元素选中
      if (tool === 'move' || oldTool === 'handMove') {
        canvas.defaultCursor = 'default'
        canvas.setCursor(canvas.defaultCursor)
        canvas.skipTargetFind = false
        canvas.selection = true
      }
      if (tool === 'handMove') {
        canvas.defaultCursor = 'grab'
        canvas.setCursor(canvas.defaultCursor)
        canvas.skipTargetFind = true
        canvas.selection = false
      } else if (['rect', 'ellipse', 'triangle', 'text'].includes(tool)) {
        canvas.defaultCursor = 'crosshair'
        canvas.setCursor(canvas.defaultCursor)
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
              if (!tempObject) return
              let opt: Partial<Rect | Ellipse> = {
                left: min(startLeft, startLeft + lengthX.value),
                top: min(startTop, startTop + lengthY.value),
                width: max(abs(ceil(lengthX.value)), 1),
                height: max(abs(ceil(lengthY.value)), 1),
              }
              tempObject.set({})
              if (tool === 'ellipse') {
                opt = {
                  ...opt,
                  rx: max(abs(ceil(lengthX.value)) / 2, 0.5),
                  ry: max(abs(ceil(lengthY.value)) / 2, 0.5),
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

  private initHandMove() {
    const canvas = this.canvas
    const { space } = useMagicKeys()
    const { activeTool } = storeToRefs(useAppStore())
    // 鼠标中键拖动视窗
    let vpt = canvas.viewportTransform
    let lastTool: EditTool | undefined
    let mouseDown = false
    const { lengthX, lengthY, isSwiping } = useFabricSwipe({
      onSwipeStart: (e) => {
        // 判断isSwiping.value，修复双击中键卡在move工具上
        if (!isSwiping.value) return
        vpt = canvas.viewportTransform
        if (e.button === 2 && activeTool.value !== 'handMove') {
          lastTool = activeTool.value
          activeTool.value = 'handMove'
          canvas.setCursor('grabbing')
        }
        if (e.button === 1 && activeTool.value === 'handMove') {
          canvas.setCursor('grabbing')
        }
        mouseDown = true
      },
      onSwipe: () => {
        if (activeTool.value === 'handMove') {
          if (mouseDown) {
            canvas.setCursor('grabbing')
            const deltaPoint = new Point(lengthX.value, lengthY.value)
              .scalarDivide(canvas.getZoom())
              .transform(vpt)
              .scalarMultiply(-1)
            canvas.absolutePan(deltaPoint)
          }
        }
      },
      onSwipeEnd: () => {
        if (lastTool) {
          if (!space.value) {
            activeTool.value = lastTool
          }
          canvas.setCursor(canvas.defaultCursor)
          lastTool = undefined
        }
        mouseDown = false
      },
    })
    // 空格键切换移动工具
    let _lastTool: EditTool | undefined
    watch(space, (value) => {
      if (value) {
        _lastTool = activeTool.value
        activeTool.value = 'handMove'
      } else if (_lastTool) {
        activeTool.value = _lastTool
        _lastTool = undefined
      }
    })
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
