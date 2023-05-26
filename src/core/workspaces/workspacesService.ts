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
    this.setCurrentWorkspaceId(this.addWorkspace('页面 1'))
    this.setCurrentWorkspaceId(this.addWorkspace('页面 2'))
  }

  public getCurrentWorkspaceId(): string {
    return this.currentId
  }

  public setCurrentWorkspaceId(workspaceId: string): void {
    if (!this.getWorkspace(workspaceId)) return
    if (this.currentId === workspaceId) return
    this.eventbus.emit('workspaceChangeBefore', this.getCurrentWorkspaceId())
    this.currentId = workspaceId
    this.eventbus.emit('workspaceChangeAfter', this.getCurrentWorkspaceId())
  }

  public getAllWorkspaces(): IWorkspace[] {
    return this.workspaces
  }

  public setWorkspaceName(workspaceId: string, name: string) {
    const workspace = this.getWorkspace(workspaceId)
    if (!workspace || workspace.name === name) return
    this.eventbus.emit('workspaceChangeBefore', this.getCurrentWorkspaceId())
    workspace.name = name
    this.eventbus.emit('workspaceChangeAfter', this.getCurrentWorkspaceId())
  }

  public getWorkspace(workspaceId: string) {
    return this.workspaces.find((workspace) => workspace.id === workspaceId)
  }

  public addWorkspace(name: string): string {
    const id = randomText()
    this.workspaces.push({ id, name })
    this.eventbus.emit('workspaceAdd', id)
    return id
  }

  public removeWorkspace(workspaceId: string) {
    if (!this.getWorkspace(workspaceId)) return
    const index = this.workspaces.findIndex((workspace) => workspace.id === workspaceId)
    this.workspaces.splice(index, 1)
    this.eventbus.emit('workspaceRemove', workspaceId)
  }
}
