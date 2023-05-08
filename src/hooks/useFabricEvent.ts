import { useCanvasStore } from '@/store'
import type { Fn } from '@vueuse/shared'
import { tryOnScopeDispose } from '@vueuse/shared'
import { fabric } from '@/types'

type TEventCallback<T = any> = (options: T) => any
type IEvent = fabric.CanvasEvents & fabric.ObjectEvents

export function useFabricEvent<K extends keyof IEvent, E extends IEvent[K]>(
  eventName: K,
  handler: TEventCallback<E>,
): Fn

export function useFabricEvent<K extends keyof IEvent, E extends IEvent[K]>(
  handlers: Record<K, TEventCallback<E>>,
): Fn

export function useFabricEvent(eventName: any, handler?: any) {
  const { canvas } = storeToRefs(useCanvasStore())

  canvas.value.on(eventName, handler)

  const stop = () => {
    canvas.value.off(eventName, handler)
  }

  tryOnScopeDispose(stop)

  return stop
}
