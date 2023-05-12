import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { Point } from '@/lib/fabric'
import { useMagicKeys, clamp } from '@vueuse/core'
import { useAppStore } from '@/store'

/**
 * 画板默认滚动行为
 */
export class HandleWheelScroll {
  constructor(@IFabricCanvas canvas: FabricCanvas) {
    const { zoom } = storeToRefs(useAppStore())

    zoom.value = canvas.getZoom()

    const { ctrl, shift } = useMagicKeys()

    canvas.on('mouse:wheel', (e) => {
      e.e.preventDefault()
      e.e.stopPropagation()
      const { deltaX, deltaY, offsetX, offsetY } = e.e
      // 缩放视窗
      if (ctrl.value) {
        const zoomFactor = Math.abs(deltaY) < 10 ? deltaY * 2 : deltaY / 3
        let newZoom = canvas.getZoom() * (1 - zoomFactor / 200)
        newZoom = clamp(newZoom, 0.01, 20)
        zoom.value = newZoom
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
