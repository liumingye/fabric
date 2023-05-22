import { createDecorator } from '@/core/instantiation/instantiation'
import { registerSingleton } from '@/core/instantiation/extensions'
import { Mitt } from '@/core/eventbus/mitt'

export type Events = {
  undoRedoStackChange: undefined
  layerRename: { id: string }
}

export type EventbusService = Mitt<Events>

export const IEventbusService = createDecorator<EventbusService>('eventbusService')

registerSingleton(IEventbusService, Mitt)
