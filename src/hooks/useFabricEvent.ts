import { useAppStore } from '@/store'
import type { Fn } from '@vueuse/shared'
import { tryOnScopeDispose } from '@vueuse/shared'
import { fabric } from '@/types'
import { useEditorServices } from '@/editor'

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
  const { canvas } = useEditorServices()

  canvas.on(eventName, handler)

  const stop = () => {
    canvas.off(eventName, handler)
  }

  tryOnScopeDispose(stop)

  return stop
}
