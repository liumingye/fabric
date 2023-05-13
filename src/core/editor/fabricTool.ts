import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { KeybindingService, IKeybindingService } from '@/core/keybinding/keybindingService'
import { useFabricSwipe } from '@/hooks/useFabricSwipe'
import { Ellipse, FabricObject, Point, Rect } from '@/lib/fabric'
import { useAppStore } from '@/store'
import { EditTool } from '@/types'
import { useMagicKeys } from '@vueuse/core'

export class FabricTool {
  constructor(
    @IFabricCanvas private canvas: FabricCanvas,
    @IKeybindingService private keybinding: KeybindingService,
  ) {
    this.initWatch()
    this.initHandMove()
    this.initKeybinding()
  }

  initWatch() {
    const canvas = this.canvas
    const { activeTool } = storeToRefs(useAppStore())
    // 监听activeTool
    let swipeStop: (() => void) | undefined
    let tempObject: FabricObject | undefined
    watch(activeTool, (newValue, oldValue) => {
      if (swipeStop) {
        swipeStop()
        swipeStop = undefined
      }
      // 移动工具关闭元素选中
      if (newValue === 'move' || oldValue === 'handMove') {
        canvas.defaultCursor = 'default'
        canvas.setCursor(canvas.defaultCursor)
        canvas.skipTargetFind = false
        canvas.selection = true
      }
      if (newValue === 'handMove') {
        canvas.defaultCursor = 'grab'
        canvas.setCursor(canvas.defaultCursor)
        canvas.skipTargetFind = true
        canvas.selection = false
      } else if (newValue === 'rect' || newValue === 'ellipse') {
        canvas.defaultCursor = 'crosshair'
        canvas.setCursor(canvas.defaultCursor)
        canvas.skipTargetFind = true
        canvas.selection = false
        let startLeft: number
        let startTop: number
        const { stop, lengthX, lengthY } = useFabricSwipe({
          onSwipeStart(e) {
            if (e.button !== 1) return
            const { x, y } = canvas.getPointer(e.e)
            startLeft = Math.ceil(x)
            startTop = Math.ceil(y)
            switch (newValue) {
              case 'rect':
                tempObject = new Rect({
                  left: startLeft,
                  top: startTop,
                  width: 0,
                  height: 0,
                })
                break
              case 'ellipse':
                tempObject = new Ellipse({
                  left: startLeft,
                  top: startTop,
                  width: 0,
                  height: 0,
                  rx: 0,
                  ry: 0,
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
                left: Math.min(startLeft, startLeft + lengthX.value),
                top: Math.min(startTop, startTop + lengthY.value),
                width: Math.abs(Math.ceil(lengthX.value)),
                height: Math.abs(Math.ceil(lengthY.value)),
              }
              tempObject.set({})
              if (newValue === 'ellipse') {
                opt = {
                  ...opt,
                  rx: Math.abs(Math.ceil(lengthX.value)) / 2,
                  ry: Math.abs(Math.ceil(lengthY.value)) / 2,
                }
              }
              tempObject.set(opt)
              canvas.renderAll()
            })
          },
          onSwipeEnd() {
            if (tempObject) {
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

  initHandMove() {
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

  initKeybinding() {
    // 快捷键
    const { activeTool } = storeToRefs(useAppStore())
    this.keybinding.bind('v', () => (activeTool.value = 'move'))
    this.keybinding.bind('h', () => (activeTool.value = 'handMove'))
    this.keybinding.bind('r', () => (activeTool.value = 'rect'))
    this.keybinding.bind('o', () => (activeTool.value = 'ellipse'))
  }
}
