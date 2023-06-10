import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { KeybindingService, IKeybindingService } from '@/core/keybinding/keybindingService'
import { useFabricSwipe } from '@/hooks/useFabricSwipe'
import { Ellipse, Point, Rect, Triangle, Textbox, FabricObject, Path, Board } from '@fabric'
import type { TSimpleParsedCommand } from 'fabric/src/util/path/typedefs'
import { useAppStore } from '@/store'
import { useMagicKeys, useActiveElement, toValue, Fn } from '@vueuse/core'
import { Disposable } from '@/utils/lifecycle'
import { getMirrorPoint } from '@/utils/fill'
import { EventbusService, IEventbusService } from '@/core/eventbus/eventbusService'

type ToolOption = {
  defaultCursor: string
  skipTargetFind: boolean
  selection: boolean
}

type ToolType = 'move' | 'handMove' | 'shape'

export class FabricTool extends Disposable {
  private space = useMagicKeys().space

  private options: Record<ToolType, ToolOption> = {
    move: {
      defaultCursor: 'default',
      skipTargetFind: false,
      selection: true,
    },
    handMove: {
      defaultCursor: 'grab',
      skipTargetFind: true,
      selection: false,
    },
    shape: {
      defaultCursor: 'crosshair',
      skipTargetFind: true,
      selection: false,
    },
  }

  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService private readonly keybinding: KeybindingService,
    @IEventbusService private readonly eventbus: EventbusService,
  ) {
    super()

    useAppStore().activeTool = 'move'

    this.initWatch()
    this.initHandMove()
    this.initKeybinding()
  }

  private applyOption(tool?: ToolType) {
    tool = tool ?? (storeToRefs(useAppStore()).activeTool.value as ToolType)
    const { defaultCursor, skipTargetFind, selection } = this.options[tool] ?? this.options.shape

    this.canvas.defaultCursor = defaultCursor
    this.canvas.setCursor(defaultCursor)
    this.canvas.skipTargetFind = skipTargetFind
    this.canvas.selection = selection
  }

  private initWatch() {
    const { activeTool } = storeToRefs(useAppStore())

    // 监听activeTool
    watch(activeTool, (newTool, oldTool) => {
      if (this.toolStop) {
        this.toolStop()
        this.toolStop = undefined
      }

      if (oldTool === 'handMove') {
        this.handMoveActivate = false
      }

      this.applyOption()

      // 移动工具
      if (newTool === 'handMove') {
        this.handMoveActivate = true
      }

      // 图形工具
      else if (['rect', 'ellipse', 'triangle', 'text'].includes(newTool)) {
        this.switchShape(newTool as 'rect' | 'ellipse' | 'triangle' | 'text')
      }

      // 矢量|钢笔
      else if (newTool === 'vector') {
        this.switchVector()
      }
    })
  }

  private toolStop: Fn | undefined

  private switchShape(shape: 'rect' | 'ellipse' | 'triangle' | 'text') {
    const { canvas } = this
    let coordsStart: Point | undefined
    let tempObject: FabricObject | undefined
    const { stop, isSwiping } = useFabricSwipe({
      onSwipeStart: (e) => {
        if (e.button !== 1 || this.space.value) return
        /*
         * 只有mouseMove的时候isSwiping才会为true
         * mouseUp会判断isSwiping的值来决定是否执行onSwipeEnd
         * 这里强制设置成true，让点击也可执行onSwipeEnd
         */
        isSwiping.value = true
        // 获得坐标
        coordsStart = e.pointer
        // 创建形状
        switch (shape) {
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
          hideOnLayer: true,
        })
        // 不发送ObjectAdded事件
        tempObject.noEventObjectAdded = true
        // 添加对象到画板
        const board = this.canvas._searchPossibleTargets(
          this.canvas.getObjects('Board'),
          e.absolutePointer,
        ) as Board | undefined
        const parent = board || canvas
        parent.add(tempObject)
        // 取消不发送
        tempObject.noEventObjectAdded = false
        // 设置激活对象
        canvas.setActiveObject(tempObject)
        tempObject.__corner = 'br'
        canvas._setupCurrentTransform(e.e, tempObject, true)
      },
      onSwipeEnd: (e) => {
        if (!tempObject) return
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
          hideOnLayer: false,
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
          canvas.defaultCursor = 'default'
          tempObject.enterEditing(e.e)
          tempObject.selectAll()
        }
        // 通知事件
        if (!tempObject.group) {
          canvas._onObjectAdded(tempObject)
        }
        canvas.fire('selection:updated')
        canvas.requestRenderAll()
        tempObject = undefined
        useAppStore().activeTool = 'move'
      },
    })
    this.toolStop = stop
  }

  /**
   * Vector | Pen | Path
   * L: lineto, absolute
   * M: moveto, absolute
   * C: bezierCurveTo, absolute
   * Q: quadraticCurveTo, absolute
   * Z: closepath
   * getPointOnPath
   */
  private switchVector() {
    const path = new Path([], {
      fill: '',
      stroke: '#979797',
      strokeWidth: 1,
      padding: 2,
    })
    let added = false
    let tempPoint: TSimpleParsedCommand | undefined = undefined
    let button: number | undefined
    let isMove = false
    const { stop, lengthX, lengthY } = useFabricSwipe({
      onSwipeStart: (e) => {
        button = e.button
        if (button !== 1) return
        const { pointer } = e
        if (!added) {
          added = true
          path.left = pointer.x
          path.top = pointer.y
          path.path.push(['M', pointer.x, pointer.y])
          this.canvas.add(path)
          return
        }
        const lastPath = path.path[path.path.length - 1]
        // console.log(lastPath)
        if (isMove && lastPath[0] === 'C') {
          const point = getMirrorPoint(
            new Point(lastPath[5], lastPath[6]),
            new Point(lastPath[1], lastPath[2]),
          )
          tempPoint = ['C', point.x, point.y, pointer.x, pointer.y, pointer.x, pointer.y]
        } else {
          tempPoint = ['L', pointer.x, pointer.y]
        }
        path.path.push(tempPoint)
        path.setBoundingBox(true)
        path.setCoords()
        path._set('dirty', true)
        this.canvas.requestRenderAll()

        isMove = false
      },
      onSwipe: () => {
        if (button !== 1 || !tempPoint || tempPoint[0] === 'M') return

        path.path.pop()

        if (tempPoint[0] === 'L') {
          path.path.push([
            'C',
            tempPoint[1] - lengthX.value,
            tempPoint[2] - lengthY.value,
            tempPoint[1],
            tempPoint[2],
            tempPoint[1],
            tempPoint[2],
          ])
        } else {
          path.path.push([
            'C',
            tempPoint[1]! - lengthX.value,
            tempPoint[2]! - lengthY.value,
            tempPoint[3]! - lengthX.value,
            tempPoint[4]! - lengthY.value,
            tempPoint[5]!,
            tempPoint[6]!,
          ])
        }
        path.setBoundingBox(true)
        path.setCoords()
        path._set('dirty', true)
        this.canvas.requestRenderAll()
        isMove = true
        //
      },
      onSwipeEnd: () => {
        tempPoint = undefined
        button = undefined
      },
    })
    this.toolStop = () => {
      stop()
    }
  }

  private _handMoveActivate = false

  private get handMoveActivate() {
    return this._handMoveActivate
  }

  private set handMoveActivate(value) {
    this._handMoveActivate = value
    this.eventbus.emit('setEdgeMoveStatus', !value)
  }

  /**
   *鼠标中键拖动视窗
   */
  private initHandMove() {
    const canvas = this.canvas
    const { activeTool } = storeToRefs(useAppStore())

    /** 是否需要执行setCoords */
    let needSetCoords = false

    /** 鼠标移动开始的vpt */
    let vpt = canvas.viewportTransform

    const { lengthX, lengthY, isSwiping } = useFabricSwipe({
      onSwipeStart: (e) => {
        if (
          e.button === 2 || // 鼠标中键
          (this.space.value && e.button === 1) || // 空格键+鼠标左键
          activeTool.value === 'handMove' // 移动工具
        ) {
          isSwiping.value = true
          vpt = canvas.viewportTransform
          this.handMoveActivate = true
          this.applyOption('handMove')
          canvas.setCursor('grabbing')
        }
      },
      onSwipe: () => {
        if (!this.handMoveActivate) return

        canvas.setCursor('grabbing')

        requestAnimationFrame(() => {
          const deltaPoint = new Point(lengthX.value, lengthY.value)
            .scalarDivide(canvas.getZoom())
            .transform(vpt)
            .scalarMultiply(-1)
          canvas.absolutePan(deltaPoint, true)
          needSetCoords = true
        })
      },
      onSwipeEnd: () => {
        if (!this.handMoveActivate) return

        // 恢复鼠标指针
        if (this.space.value) {
          this.applyOption('handMove')
        } else {
          this.applyOption()
        }

        // 关闭 handMove
        if (activeTool.value !== 'handMove' && !this.space.value) {
          this.handMoveActivate = false
        }

        // 更新所有元素坐标
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
      computed(() => [this.space.value, notUsingInput.value].every((i) => toValue(i))),
      (space) => {
        if (isSwiping.value) return

        this.handMoveActivate = space

        // 恢复鼠标指针
        if (space) {
          this.applyOption('handMove')
        } else {
          this.applyOption()
        }
      },
    )
  }

  private initKeybinding() {
    // 快捷键
    const { activeTool } = storeToRefs(useAppStore())
    this.keybinding.bind({
      v: () => (activeTool.value = 'move'),
      h: () => (activeTool.value = 'handMove'),
      r: () => (activeTool.value = 'rect'),
      o: () => (activeTool.value = 'ellipse'),
      t: () => (activeTool.value = 'text'),
    })
  }
}
