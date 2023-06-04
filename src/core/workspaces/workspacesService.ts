import { createDecorator } from '@/core/instantiation/instantiation'
import { EventbusService, IEventbusService } from '@/core/eventbus/eventbusService'
import { Disposable } from '@/utils/lifecycle'
import { randomText } from '@/utils/strings'

export const IWorkspacesService = createDecorator<WorkspacesService>('workspacesService')

type IWorkspace = { id: string; name: string }

export class WorkspacesService extends Disposable {
  declare readonly _serviceBrand: undefined

  private workspaces: IWorkspace[] = []

  private currentId = ''

  constructor(@IEventbusService private readonly eventbus: EventbusService) {
    super()
  }

  public getCurrentId(): string {
    return this.currentId
  }

  public setCurrentId(workspaceId: string): void {
    if (!this.get(workspaceId) || this.currentId === workspaceId) return
    const param = {
      oldId: this.currentId,
      newId: workspaceId,
    }
    this.eventbus.emit('workspaceChangeBefore', param)
    this.currentId = workspaceId
    this.eventbus.emit('workspaceChangeAfter', param)
  }

  public all(): IWorkspace[] {
    return this.workspaces
  }

  public set(workspaceId: string, name: string) {
    const workspace = this.get(workspaceId)
    if (!workspace || workspace.name === name) return
    workspace.name = name
  }

  public get(workspaceId: string) {
    return this.workspaces.find((workspace) => workspace.id === workspaceId)
  }

  public add(name: string): string {
    const id = randomText()
    const param = {
      oldId: this.currentId,
      newId: id,
    }
    this.eventbus.emit('workspaceAddBefore', param)
    this.workspaces.push({ id, name })
    this.eventbus.emit('workspaceAddAfter', param)
    return id
  }

  public remove(workspaceId: string) {
    if (!this.get(workspaceId)) return
    this.eventbus.emit('workspaceRemoveBefore', workspaceId)
    const index = this.workspaces.findIndex((workspace) => workspace.id === workspaceId)
    this.workspaces.splice(index, 1)
    this.eventbus.emit('workspaceRemoveAfter', workspaceId)
    if (workspaceId === this.currentId) {
      if (this.workspaces[index]) {
        this.setCurrentId(this.workspaces[index].id)
      } else if (this.workspaces[index - 1]) {
        this.setCurrentId(this.workspaces[index - 1].id)
      }
    }
  }

  public size(): number {
    return this.workspaces.length
  }

  public dispose() {
    super.dispose()
    this.workspaces = []
  }
}
