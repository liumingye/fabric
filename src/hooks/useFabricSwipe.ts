import { useCanvasStore } from '@/store'
import { tryOnScopeDispose } from '@vueuse/shared'
import type { TPointerEventInfo, TPointerEvent } from '@/lib/fabric'

export type UseSwipeDirection = 'up' | 'down' | 'left' | 'right' | 'none'

export interface UseSwipeOptions {
  onSwipeStart?: (e: TPointerEventInfo<TPointerEvent>) => void
  onSwipe?: (e: TPointerEventInfo<TPointerEvent>) => void
  onSwipeEnd?: (e: TPointerEventInfo<TPointerEvent>) => void
}

export function useFabricSwipe(options: UseSwipeOptions = {}) {
  const { onSwipe, onSwipeEnd, onSwipeStart } = options

  const coordsStart = reactive({ x: 0, y: 0 })
  const coordsEnd = reactive({ x: 0, y: 0 })
  const isSwiping = ref(false)

  const diffX = computed(() => coordsEnd.x - coordsStart.x)
  const diffY = computed(() => coordsEnd.y - coordsStart.y)

  const getTouchEventCoords = (e: MouseEvent) => [e.clientX, e.clientY]

  const updateCoordsStart = (x: number, y: number) => {
    coordsStart.x = x
    coordsStart.y = y
  }

  const updateCoordsEnd = (x: number, y: number) => {
    coordsEnd.x = x
    coordsEnd.y = y
  }

  const { canvas } = storeToRefs(useCanvasStore())

  const mouseDown = (e: TPointerEventInfo<TPointerEvent>) => {
    const [x, y] = getTouchEventCoords(e.e as MouseEvent)
    updateCoordsStart(x, y)
    updateCoordsEnd(x, y)
    onSwipeStart?.(e)
  }
  const mouseMove = (e: TPointerEventInfo<TPointerEvent>) => {
    const [x, y] = getTouchEventCoords(e.e as MouseEvent)
    updateCoordsEnd(x, y)
    if (!isSwiping.value) {
      isSwiping.value = true
    }
    if (isSwiping.value) {
      onSwipe?.(e)
    }
  }
  const mouseUp = (e: TPointerEventInfo<TPointerEvent>) => {
    if (isSwiping.value) {
      onSwipeEnd?.(e)
    }
    isSwiping.value = false
  }

  canvas.value.on('mouse:down', mouseDown)
  canvas.value.on('mouse:move', mouseMove)
  canvas.value.on('mouse:up', mouseUp)

  const stop = () => {
    canvas.value.off('mouse:down', mouseDown)
    canvas.value.off('mouse:move', mouseMove)
    canvas.value.off('mouse:up', mouseUp)
  }

  tryOnScopeDispose(stop)

  return {
    isSwiping,
    coordsStart,
    coordsEnd,
    lengthX: diffX,
    lengthY: diffY,
    stop,
  }
}
