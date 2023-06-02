import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { Point, TMat2D, TPointerEvent, TPointerEventInfo } from '@fabric'
import { useIntervalFn, useMagicKeys } from '@vueuse/core'
import { Disposable } from '@/utils/lifecycle'
import { useFabricSwipe } from '@/hooks/useFabricSwipe'
import { EventbusService, IEventbusService } from '@/core/eventbus/eventbusService'

/**
 * 画板默认滚动行为
 */
export class HandleWheelScroll extends Disposable {
  private edgeMoveStatus = true

  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IEventbusService private readonly eventbus: EventbusService,
  ) {
    super()
    this.initWhellScroll()
    this.initEdgeMove()
  }

  /**
   * 鼠标滚动
   */
  private initWhellScroll() {
    const { ctrl, cmd, shift } = useMagicKeys()

    this.canvas.on('mouse:wheel', (e) => {
      e.e.preventDefault()
      e.e.stopPropagation()
      const { deltaX, deltaY, offsetX, offsetY } = e.e
      // 缩放视窗
      if (ctrl.value || cmd.value) {
        const zoomFactor = Math.abs(deltaY) < 10 ? deltaY * 2 : deltaY / 3
        const newZoom = this.canvas.getZoom() * (1 - zoomFactor / 200)
        this.canvas.zoomToPoint(new Point(offsetX, offsetY), newZoom)
        return
      }
      // 滚动画布
      const deltaPoint = new Point()
      if (shift.value) {
        deltaPoint.x = deltaX > 0 ? -20 : 20
      } else {
        deltaPoint.y = deltaY > 0 ? -20 : 20
      }
      this.canvas.relativePan(deltaPoint)
    })
  }

  /**
   * 边缘移动
   */
  private initEdgeMove() {
    let event: TPointerEventInfo<TPointerEvent> | undefined

    /** 是否需要执行setCoords */
    let needSetCoords = false

    const { pause, resume } = useIntervalFn(
      () => {
        if (!event) return

        const A = new Point(24, 24)
        const B = new Point(this.canvas.width, this.canvas.height).subtract(A)
        const [pos, distance] = this.judgePosition(event.absolutePointer, A, B)
        if (pos === 0) return

        const deltaPoint = new Point()
        const amount = Math.min(distance, 20)
        if (pos & 1) deltaPoint.x = amount
        if (pos & 2) deltaPoint.x = -amount
        if (pos & 4) deltaPoint.y = amount
        if (pos & 8) deltaPoint.y = -amount

        // relativePan 会执行 setCoords 导致卡顿，不使用

        const vpt: TMat2D = [...this.canvas.viewportTransform]
        vpt[4] += deltaPoint.x
        vpt[5] += deltaPoint.y
        this.canvas.viewportTransform = vpt
        this.canvas.calcViewportBoundaries()
        this.canvas.requestRenderAll()
        this.canvas._onMouseMove(event.e)
        needSetCoords = true
      },
      16, // 1000 / 60
      {
        immediate: false,
      },
    )

    const { isSwiping } = useFabricSwipe({
      onSwipeStart: () => {
        if (!this.edgeMoveStatus) return
        isSwiping.value = true
        resume()
      },
      onSwipe: (e) => {
        if (!this.edgeMoveStatus) return
        event = e
      },
      onSwipeEnd: () => {
        pause()
        event = undefined
        if (needSetCoords) {
          this.canvas.setViewportTransform(this.canvas.viewportTransform)
          needSetCoords = false
        }
      },
    })

    this.eventbus.on('setEdgeMoveStatus', (value) => {
      this.edgeMoveStatus = value
    })
  }

  /**
   * 判断点T相对于矩形的位置和距离
   * @param {Point} T - 待判断的点
   * @param {Point} A - 矩形左上角的点
   * @param {Point} B - 矩形右下角的点
   * @returns {Array} 第一个元素是pos，第二个元素是distance
   */
  private judgePosition(T: Point, A: Point, B: Point): [number, number] {
    let pos = 0
    let distance = 0
    if (T.x < A.x) (pos |= 1), (distance += A.x - T.x)
    else if (T.x > B.x) (pos |= 2), (distance += T.x - B.x)
    if (T.y < A.y) (pos |= 4), (distance += A.y - T.y)
    else if (T.y > B.y) (pos |= 8), (distance += T.y - B.y)
    return [pos, distance]
  }
}
