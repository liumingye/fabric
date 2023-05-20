import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { Point } from '@fabric'
import { useMagicKeys } from '@vueuse/core'
import { Disposable } from '@/utils/lifecycle'

/**
 * 画板默认滚动行为
 */
export class HandleWheelScroll extends Disposable {
  constructor(@IFabricCanvas readonly canvas: FabricCanvas) {
    super()
    const { ctrl, shift } = useMagicKeys()

    canvas.on('mouse:wheel', (e) => {
      e.e.preventDefault()
      e.e.stopPropagation()
      const { deltaX, deltaY, offsetX, offsetY } = e.e
      // 缩放视窗
      if (ctrl.value) {
        const zoomFactor = Math.abs(deltaY) < 10 ? deltaY * 2 : deltaY / 3
        const newZoom = canvas.getZoom() * (1 - zoomFactor / 200)
        canvas.zoomToPoint(new Point(offsetX, offsetY), newZoom)
        return
      }
      // 滚动画布
      const deltaPoint = new Point()
      if (shift.value) {
        deltaPoint.x = deltaX > 0 ? -20 : 20
      } else {
        deltaPoint.y = deltaY > 0 ? -20 : 20
      }
      canvas.relativePan(deltaPoint)
    })
  }
}
