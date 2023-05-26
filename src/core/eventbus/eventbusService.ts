import { createDecorator } from '@/core/instantiation/instantiation'
import { registerSingleton } from '@/core/instantiation/extensions'
import { Mitt } from '@/core/eventbus/mitt'

export type Events = {
  undoRedoStackChange: undefined
  layerRename: { id: string }
  setEdgeMoveStatus: boolean
  workspaceChangeBefore: string
  workspaceChangeAfter: string
  workspaceAdd: string
  workspaceRemove: string
}

export type EventbusService = Mitt<Events>

export const IEventbusService = createDecorator<EventbusService>('eventbusService')

registerSingleton(IEventbusService, Mitt)
