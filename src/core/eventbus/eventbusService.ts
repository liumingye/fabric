import { createDecorator } from '@/core/instantiation/instantiation'
import { registerSingleton, InstantiationType } from '@/core/instantiation/extensions'
import { Mitt } from '@/core/eventbus/mitt'

type WworkspaceParam = {
  oldId: string | undefined
  newId: string
}

export type Events = {
  undoRedoStackChange: undefined
  layerRename: { id: string }
  setEdgeMoveStatus: boolean
  workspaceChangeBefore: WworkspaceParam
  workspaceChangeAfter: WworkspaceParam
  workspaceAddBefore: WworkspaceParam
  workspaceAddAfter: WworkspaceParam
  workspaceRemoveBefore: string
  workspaceRemoveAfter: string
}

export class EventbusService extends Mitt<Events> {}

export const IEventbusService = createDecorator<EventbusService>('eventbusService')

registerSingleton(IEventbusService, Mitt, InstantiationType.Eager)
