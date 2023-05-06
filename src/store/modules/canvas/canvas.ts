import { Canvas, Rect, Circle } from '@/lib/fabric'

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

  // test
  const rect = new Rect({
    top: 100,
    left: 100,
    width: 200,
    height: 200,
    fill: '#dd14ab',
    // strokeWidth: 20,
  })
  const circle = new Circle({
    top: 0,
    left: 0,
    radius: 50,
    fill: '#f78058',
  })
  canvas.value.add(circle, rect)

  return {
    canvas,
    activeObject,
  }
})
