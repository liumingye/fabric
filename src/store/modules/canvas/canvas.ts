import { Canvas, Rect, Point } from '@/types/fabric'
import { random } from 'lodash'
import { clamp, useMagicKeys } from '@vueuse/core'

export const useCanvasStore = defineStore('canvas', () => {
  const createCanvasElement = () => document.createElement('canvas')

  const canvas = computed(
    () =>
      new Canvas(createCanvasElement(), {
        hoverCursor: 'default',
        preserveObjectStacking: true,
        selectionBorderColor: 'rgba(42,130,228,0.8)',
        selectionColor: 'rgba(42,130,228,0.2)',
        uniformScaling: false,
      }),
  )

  const activeObject = computed(() => canvas.value.activeObject.value)

  const { shift, ctrl } = useMagicKeys()

  // 默认纵向滚动 shift横向滚动 ctrl缩放
  canvas.value.on('mouse:wheel', (e) => {
    e.e.preventDefault()
    e.e.stopPropagation()
    const { deltaX, deltaY, offsetX, offsetY } = e.e
    // 缩放视窗
    if (ctrl.value) {
      const zoomFactor = Math.abs(deltaY) < 10 ? deltaY * 2 : deltaY / 3
      let newZoom = canvas.value.getZoom() * (1 - zoomFactor / 200)
      newZoom = clamp(newZoom, 0.01, 20)
      canvas.value.zoomToPoint(new Point(offsetX, offsetY), newZoom)
      return
    }
    // 滚动画布
    const delta = shift.value ? deltaX : deltaY > 0 ? -20 : 20
    canvas.value.relativePan(shift.value ? new Point(-delta, 0) : new Point(0, delta))
  })

  // test
  for (let index = 0; index < 10; index++) {
    canvas.value.add(
      new Rect({
        top: random(0, 500),
        left: random(0, 600),
        width: random(50, 300),
        height: random(50, 300),
        fill: '#' + Math.random().toString(16).substring(2, 8),
        strokeWidth: random(0, 10),
        stroke: '#fff',
      }),
    )
  }

  return {
    canvas,
    activeObject,
  }
})
