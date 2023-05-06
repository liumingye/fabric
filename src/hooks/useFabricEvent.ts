import { useCanvasStore } from '@/store'
import type { Fn } from '@vueuse/shared'
import { tryOnScopeDispose } from '@vueuse/shared'
import type { fabric } from 'editor'

type TEventCallback<T = any> = (options: T) => any
type IEvent = fabric.CanvasEvents & fabric.ObjectEvents

export function useFabricEvent<E extends keyof IEvent>(eventName: E, handler: TEventCallback<E>): Fn

export function useFabricEvent<E extends keyof IEvent>(handlers: Record<E, TEventCallback<E>>): Fn

export function useFabricEvent(eventName: any, handler?: any) {
  const { canvas } = storeToRefs(useCanvasStore())

  onMounted(() => {
    canvas.value.on(eventName, handler)
  })

  const stop = () => {
    canvas.value.off(eventName, handler)
  }

  tryOnScopeDispose(stop)

  return stop
}
