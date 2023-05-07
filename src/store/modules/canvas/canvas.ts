import { Canvas, Rect, Point, Board } from '@/types/fabric'
import { random } from 'lodash'
import { clamp, useMagicKeys } from '@vueuse/core'
import { useFabricSwipe } from '@/hooks/useFabricSwipe'

type EditTool = 'select' | 'move' | 'brush'

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
        stopContextMenu: true,
        fireMiddleClick: true,
      }),
  )

  const activeObject = computed(() => canvas.value.activeObject.value)

  const activeTool = ref<EditTool>('select')

  // 默认纵向滚动 shift横向滚动 ctrl缩放
  const { shift, ctrl } = useMagicKeys()
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
    const deltaPoint = new Point()
    if (shift.value) {
      deltaPoint.x = deltaX > 0 ? -20 : 20
    } else {
      deltaPoint.y = deltaY > 0 ? -20 : 20
    }
    canvas.value.relativePan(deltaPoint)
  })

  // 鼠标中键拖动视窗
  nextTick(() => {
    let vpt = canvas.value.viewportTransform
    let lastTool: EditTool
    const { lengthX, lengthY } = useFabricSwipe({
      onSwipeStart: (e) => {
        vpt = canvas.value.viewportTransform
        if (e.button === 2) {
          lastTool = activeTool.value
          activeTool.value = 'move'
        }
      },
      onSwipe: (_e) => {
        if (activeTool.value === 'move') {
          canvas.value.setCursor('grabbing')
          const deltaPoint = new Point(lengthX.value, lengthY.value)
            .scalarDivide(canvas.value.getZoom())
            .transform(vpt)
            .scalarMultiply(-1)
          canvas.value.absolutePan(deltaPoint)
        }
      },
      onSwipeEnd: (_e) => {
        if (lastTool) {
          activeTool.value = lastTool
        }
        canvas.value.setCursor(canvas.value.defaultCursor)
      },
    })
  })

  // debug code
  const board1 = new Board([], {
    top: 0,
    left: 0,
    width: 300,
    height: 300,
    backgroundColor: '#ffff33',
  })
  const board2 = new Board([], {
    top: 400,
    left: 50,
    width: 300,
    height: 300,
    backgroundColor: '#f2b8ca',
  })
  canvas.value.add(board1, board2)
  for (let index = 0; index < 5; index++) {
    board1.add(
      new Rect({
        top: random(0, 200),
        left: random(0, 200),
        width: random(50, 100),
        height: random(50, 100),
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
