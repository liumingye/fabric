import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { KeybindingService, IKeybindingService } from '@/core/keybinding/keybindingService'
import { useFabricSwipe } from '@/hooks/useFabricSwipe'
import { Ellipse, Point, Rect, Triangle, Textbox, FabricObject, TMat2D } from '@fabric'
import { useAppStore } from '@/store'
import { useMagicKeys, useActiveElement, toValue } from '@vueuse/core'
import { Disposable } from '@/utils/lifecycle'
import { EventbusService, IEventbusService } from '@/core/eventbus/eventbusService'
import { IUndoRedoService, UndoRedo } from '@/app/editor/undoRedo/undoRedoService'

export class FabricTool extends Disposable {
  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService private readonly keybinding: KeybindingService,
    @IEventbusService private readonly eventbus: EventbusService,
    @IUndoRedoService private readonly undoRedo: UndoRedo,
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
                tempObject = new Rect({})
                break
              case 'ellipse':
                tempObject = new Ellipse({
                  rx: 50,
                  ry: 50,
                })
                break
              case 'triangle':
                tempObject = new Triangle({})
                break
              case 'text':
                tempObject = new Textbox('', {})
                break
            }
            tempObject.set({
              left: coordsStart.x,
              top: coordsStart.y,
              width: 100,
              height: 100,
              scaleX: 0.01,
              scaleY: 0.01,
            })
            // 不发送ObjectAdded事件
            tempObject.set('noEventObjectAdded', true)
            // 添加对象到画板
            canvas.add(tempObject)
            // 取消不发生
            tempObject.set('noEventObjectAdded', false)
            // 设置激活对象
            canvas.setActiveObject(tempObject)
            tempObject.__corner = 'br'
            canvas._setupCurrentTransform(e.e, tempObject, true)
          },
          onSwipeEnd: (e) => {
            if (tempObject) {
              // 如果点击画板，没有移动，设置默认宽高
              if (tempObject.scaleX <= 0.01 && tempObject.scaleY <= 0.01) {
                tempObject.set({
                  left: tempObject.left - 50,
                  top: tempObject.top - 50,
                  scaleX: 1,
                  scaleY: 1,
                })
              }
              // 设置宽高缩放
              tempObject.set({
                width: tempObject.getScaledWidth(),
                height: tempObject.getScaledHeight(),
                scaleX: 1,
                scaleY: 1,
              })
              // 特殊形状处理
              if (tempObject instanceof Ellipse) {
                tempObject.set({
                  rx: tempObject.width / 2,
                  ry: tempObject.height / 2,
                })
              } else if (tempObject instanceof Textbox) {
                tempObject.set({
                  text: '输入文本',
                })
                this.canvas.defaultCursor = 'default'
                tempObject.enterEditing(e.e)
                tempObject.selectAll()
              }
              // 通知事件
              if (tempObject.group) {
                tempObject.group._onObjectAdded(tempObject)
              } else {
                canvas._onObjectAdded(tempObject)
              }
              canvas.requestRenderAll()
              // this.undoRedo.saveState()
              tempObject = undefined
            }
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

  /**
   *鼠标中键拖动视窗
   */
  private initHandMove() {
    const canvas = this.canvas
    const { space } = useMagicKeys()
    const { activeTool } = storeToRefs(useAppStore())

    /** 是否需要执行setCoords */
    let needSetCoords = false

    /** 鼠标移动开始的vpt */
    let vpt = canvas.viewportTransform

    const { lengthX, lengthY, isSwiping } = useFabricSwipe({
      onSwipeStart: (e) => {
        // 鼠标中键 | 空格键+鼠标左键 | 移动工具
        if (e.button === 2 || (space.value && e.button === 1) || activeTool.value === 'handMove') {
          isSwiping.value = true
          vpt = canvas.viewportTransform
          this.handMoveActivate = true
          canvas.setCursor('grabbing')
        }
      },
      onSwipe: () => {
        if (this.handMoveActivate) {
          requestAnimationFrame(() => {
            canvas.setCursor('grabbing')

            // absolutePan 会执行 setCoords 导致卡顿，不使用
            const deltaVpt: TMat2D = [...vpt]
            deltaVpt[4] += lengthX.value
            deltaVpt[5] += lengthY.value
            canvas.viewportTransform = deltaVpt
            canvas.requestRenderAll()

            needSetCoords = true
          })
        }
      },
      onSwipeEnd: () => {
        if (this.handMoveActivate) {
          canvas.setCursor(canvas.defaultCursor)

          if (activeTool.value !== 'handMove' && !space.value) {
            this.handMoveActivate = false
          }
        }

        if (needSetCoords) {
          canvas.setViewportTransform(canvas.viewportTransform)
          needSetCoords = false
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
