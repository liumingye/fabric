import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { UndoRedoService as UndoRedo } from '@/core/undoRedo/undoRedoService'
import { KeybindingService, IKeybindingService } from '@/core/keybinding/keybindingService'
import { EventbusService, IEventbusService } from '@/core/eventbus/eventbusService'
import { IWorkspacesService, WorkspacesService } from '@/core/workspaces/workspacesService'
import { createDecorator } from '@/core/instantiation/instantiation'
import { Disposable } from '@/utils/lifecycle'
import { runWhenIdle } from '@/utils/async'

export const IUndoRedoService = createDecorator<UndoRedoService>('editorUndoRedoService')

export class UndoRedoService extends Disposable {
  declare readonly _serviceBrand: undefined

  private canvasEvents

  private pageId: string

  private undoRedos: Map<
    string,
    {
      instantiation: UndoRedo
      lastState: string | undefined
    }
  > = new Map()

  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService readonly keybinding: KeybindingService,
    @IEventbusService private readonly eventbus: EventbusService,
    @IWorkspacesService private readonly workspacesService: WorkspacesService,
  ) {
    super()

    keybinding.bind('mod+z', this.undo.bind(this))
    keybinding.bind(['mod+y', 'mod+shift+z'], this.redo.bind(this))

    this.canvasEvents = {
      'object:modified': this.saveState.bind(this),
    }

    canvas.on(this.canvasEvents)

    this.pageId = this.workspacesService.getCurrentId()

    this.initWorkspace()
  }

  private getUndoRedo() {
    return this.undoRedos.get(this.pageId)
  }

  public push(state: any) {
    const undoRedo = this.getUndoRedo()
    if (!undoRedo) return

    undoRedo.instantiation.push(state)
    this.eventbus.emit('undoRedoStackChange')
  }

  public redo() {
    const undoRedo = this.getUndoRedo()
    if (!undoRedo) return

    if (!undoRedo.instantiation.canRedo) return

    undoRedo.lastState = undoRedo.instantiation.redo(undoRedo.lastState)
    if (undoRedo.lastState) {
      this.loadJson(undoRedo.lastState)
      this.eventbus.emit('undoRedoStackChange')
    }
    return undoRedo.lastState
  }

  public undo() {
    const undoRedo = this.getUndoRedo()
    if (!undoRedo) return

    if (!undoRedo.instantiation.canUndo) return

    undoRedo.lastState = undoRedo.instantiation.undo(undoRedo.lastState)
    if (undoRedo.lastState) {
      this.loadJson(undoRedo.lastState)
      this.eventbus.emit('undoRedoStackChange')
    }
    return undoRedo.lastState
  }

  public reset() {
    const undoRedo = this.getUndoRedo()
    if (!undoRedo) return

    undoRedo.instantiation.reset()
    this.eventbus.emit('undoRedoStackChange')
  }

  private async loadJson(json: string) {
    const undoRedo = this.getUndoRedo()
    if (!undoRedo) return
    const { instantiation } = undoRedo

    try {
      instantiation.pause()
      await this.canvas.loadFromJSON(json)
    } finally {
      this.canvas.renderAll()
      instantiation.resume()
    }
  }

  private getJson() {
    return this.canvas.toObject()
  }

  // todo jsondiffpatch https://github.com/benjamine/jsondiffpatch
  public saveState() {
    const pageId = this.pageId
    runWhenIdle(() => {
      if (pageId !== this.pageId) return
      const undoRedo = this.getUndoRedo()
      if (!undoRedo) return
      if (!undoRedo.instantiation.isTracking) return
      this.push(undoRedo.lastState)
      undoRedo.lastState = this.getJson()
    })
  }

  // 工作区 | 页面管理
  private initWorkspace() {
    const currentId = this.workspacesService.getCurrentId()
    this.workspacesService.all().forEach((workspace) => {
      this.undoRedos.set(workspace.id, {
        instantiation: new UndoRedo(),
        lastState: this.pageId === currentId ? this.getJson() : undefined,
      })
    })
    this.eventbus.on('workspaceAddAfter', ({ newId }) => {
      this.undoRedos.set(newId, {
        instantiation: new UndoRedo(),
        lastState: this.pageId === newId ? this.getJson() : {},
      })
    })
    this.eventbus.on('workspaceRemoveAfter', (id) => {
      this.undoRedos.delete(id)
    })
    this.eventbus.on('workspaceChangeAfter', ({ newId }) => {
      this.pageId = newId
    })
  }

  public dispose(): void {
    super.dispose()
    this.keybinding.unbind(['mod+z', 'mod+y', 'mod+shift+z'])
    this.canvas.off(this.canvasEvents)
  }
}
