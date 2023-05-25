import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { KeybindingService, IKeybindingService } from '@/core/keybinding/keybindingService'
import { useFabricSwipe } from '@/hooks/useFabricSwipe'
import { Ellipse, Point, Rect, Triangle, Textbox, FabricObject } from '@fabric'
import { useAppStore } from '@/store'
import { useMagicKeys, useActiveElement, toValue } from '@vueuse/core'
import { Disposable } from '@/utils/lifecycle'
import { EventbusService, IEventbusService } from '@/core/eventbus/eventbusService'
import { IUndoRedoService, UndoRedoService } from '@/core/undoRedo/undoRedoService'

export class FabricTool extends Disposable {
  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService private readonly keybinding: KeybindingService,
    @IEventbusService private readonly eventbus: EventbusService,
    @IUndoRedoService private readonly undoRedo: UndoRedoService,
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
    let tempObject: FabricObject | undefined
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
        let coordsStart: Point | undefined
        const { stop, isSwiping } = useFabricSwipe({
          onSwipeStart: (e) => {
            if (e.button !== 1) return
            /*
             * 只有mouseMove的时候isSwiping才会为true
             * mouseUp会判断isSwiping的值来决定是否执行onSwipeEnd
             * 这里强制设置成true，让点击也可执行onSwipeEnd
             */
            isSwiping.value = true
            // 获得坐标
            coordsStart = canvas.getPointer(e.e)
            // 创建形状
            switch (tool as 'rect' | 'ellipse' | 'triangle' | 'text') {
              case 'rect':
                tempObject = new Rect({
                  left: coordsStart.x,
                  top: coordsStart.y,
                  width: 1,
                  height: 1,
                })
                break
              case 'ellipse':
                tempObject = new Ellipse({
                  left: coordsStart.x,
                  top: coordsStart.y,
                  width: 1,
                  height: 1,
                  rx: 0.5,
                  ry: 0.5,
                })
                break
              case 'triangle':
                tempObject = new Triangle({
                  left: coordsStart.x,
                  top: coordsStart.y,
                  width: 1,
                  height: 1,
                })
                break
              case 'text':
                tempObject = new Textbox('', {
                  left: coordsStart.x,
                  top: coordsStart.y,
                  width: 1,
                  height: 1,
                })
                break
            }
            // 不发送ObjectAdded事件
            tempObject.set('noEventObjectAdded', true)
            // 添加对象到画板
            canvas.add(tempObject)
            // 取消不发生
            tempObject.set('noEventObjectAdded', false)
            // 设置激活对象
            canvas.setActiveObject(tempObject)
          },
          onSwipe: (e) => {
            requestAnimationFrame(() => {
              if (!tempObject || !coordsStart) return
              // 获得坐标
              const pointerPoint = canvas.getPointer(e.e)
              // 获取移动长度
              const lengthPoint = pointerPoint.subtract(coordsStart)
              const lengthX = ceil(abs(lengthPoint.x))
              const lengthY = ceil(abs(lengthPoint.y))
              // 构建配置
              let opt: Partial<FabricObject & Ellipse> = {
                left: ceil(min(coordsStart.x, pointerPoint.x)),
                top: ceil(min(coordsStart.y, pointerPoint.y)),
                width: max(lengthX, 1),
                height: max(lengthY, 1),
              }
              if (tool === 'ellipse') {
                opt = {
                  ...opt,
                  rx: max(lengthX / 2, 0.5),
                  ry: max(lengthY / 2, 0.5),
                }
              }
              tempObject.set(opt)
              tempObject.fire('scaling', {
                e: e.e,
                transform: this.canvas._currentTransform!,
                pointer: pointerPoint,
              })
              canvas.requestRenderAll()
            })
          },
          onSwipeEnd: () => {
            if (tempObject) {
              // 如果点击画板，没有移动，设置默认宽高
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
              this.undoRedo.saveState()
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
      this.eventbus.emit('setEdgeMoveStatus', false)
    } else {
      this.canvas.defaultCursor = 'default'
      this.canvas.setCursor('default')
      this.canvas.skipTargetFind = false
      this.canvas.selection = true
      this.eventbus.emit('setEdgeMoveStatus', true)
    }
  }

  private initHandMove() {
    const canvas = this.canvas
    const { space } = useMagicKeys()
    const { activeTool } = storeToRefs(useAppStore())
    // 鼠标中键拖动视窗
    let vpt = canvas.viewportTransform
    const { lengthX, lengthY } = useFabricSwipe({
      onSwipeStart: (e) => {
        if (e.button === 2 || (space.value && e.button === 1) || activeTool.value === 'handMove') {
          vpt = canvas.viewportTransform
          this.handMoveActivate = true
          canvas.setCursor('grabbing')
        }
      },
      onSwipe: () => {
        if (this.handMoveActivate) {
          canvas.setCursor('grabbing')
          const deltaPoint = new Point(lengthX.value, lengthY.value)
            .scalarDivide(canvas.getZoom())
            .transform(vpt)
            .scalarMultiply(-1)
          canvas.absolutePan(deltaPoint)
        }
      },
      onSwipeEnd: () => {
        if (this.handMoveActivate) {
          canvas.setCursor(canvas.defaultCursor)

          if (activeTool.value !== 'handMove' && !space.value) {
            this.handMoveActivate = false
          }
        }
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
