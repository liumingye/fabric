import { defineStore } from 'pinia'
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
      }),
  )

  // test
  const rect = new Rect({
    top: 100,
    left: 100,
    width: 200,
    height: 200,
    fill: '#4499ff',
  })
  const circle = new Circle({
    top: 100,
    left: 100,
    radius: 50,
    fill: '#ddd',
  })
  canvas.value.add(circle, rect)

  return {
    canvas,
  }
})
