import { tryOnScopeDispose } from '@vueuse/shared'
import type { TPointerEventInfo, TPointerEvent } from '@fabric'
import { useEditor } from '@/app'
import { useFabricEvent } from '@/hooks/useFabricEvent'

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
  const isPointerDown = ref(false)

  const diffX = computed(() => coordsEnd.x - coordsStart.x)
  const diffY = computed(() => coordsEnd.y - coordsStart.y)

  const getTouchEventCoords = (e: TPointerEvent) => {
    if (e instanceof PointerEvent) {
      return [e.x, e.y]
    }
    if (e instanceof TouchEvent) {
      return [e.touches[0].clientX, e.touches[0].clientY]
    }
    return [e.clientX, e.clientY]
  }

  const updateCoordsStart = (x: number, y: number) => {
    coordsStart.x = x
    coordsStart.y = y
  }

  const updateCoordsEnd = (x: number, y: number) => {
    coordsEnd.x = x
    coordsEnd.y = y
  }

  const { canvas } = useEditor()

  const mouseDown = (e: TPointerEventInfo<TPointerEvent>) => {
    if (e.e instanceof TouchEvent && e.e.touches.length !== 1) return
    isPointerDown.value = true
    const [x, y] = getTouchEventCoords(e.e)
    updateCoordsStart(x, y)
    updateCoordsEnd(x, y)
    onSwipeStart?.(e)
  }
  const mouseMove = (e: TPointerEventInfo<TPointerEvent>) => {
    if (!isPointerDown.value) return
    if (e.e instanceof TouchEvent && e.e.touches.length !== 1) return
    const [x, y] = getTouchEventCoords(e.e)
    updateCoordsEnd(x, y)
    isSwiping.value = true
    onSwipe?.(e)
  }
  const mouseUp = (e: TPointerEventInfo<TPointerEvent>) => {
    if (isSwiping.value) {
      onSwipeEnd?.(e)
    }
    isPointerDown.value = false
    isSwiping.value = false
  }

  const stop = useFabricEvent({
    'mouse:down': mouseDown,
    'mouse:move': mouseMove,
    'mouse:up': mouseUp,
  })

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
