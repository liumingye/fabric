import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { UndoRedoBase } from '@/core/undoRedo/undoRedoBase'
import { KeybindingService, IKeybindingService } from '@/core/keybinding/keybindingService'
import { EventbusService, IEventbusService } from '@/core/eventbus/eventbusService'
import { IWorkspacesService, WorkspacesService } from '@/core/workspaces/workspacesService'
import { createDecorator } from '@/core/instantiation/instantiation'
import { Disposable } from '@/utils/lifecycle'
import { runWhenIdle, IDisposable } from '@/utils/async'
import { UndoRedoService, IUndoRedoService } from '@/core/undoRedo/undoRedoService'
import { CommandBase } from '@/core/undoRedo/commands'
import { debounce } from 'lodash'

export const IEditorUndoRedoService =
  createDecorator<EditorUndoRedoService>('editorUndoRedoService')

class SaveStateCommand extends CommandBase {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly editorUndoRedoService: EditorUndoRedoService,
    private pageId: string,
  ) {
    super()
  }

  public undo() {
    this.workspacesService.setCurrentId(this.pageId)
    this.editorUndoRedoService.undo()
  }

  public redo() {
    this.workspacesService.setCurrentId(this.pageId)
    this.editorUndoRedoService.redo()
  }
}

export class EditorUndoRedoService extends Disposable {
  declare readonly _serviceBrand: undefined

  private canvasEvents

  private pageId: string

  private undoRedos: Map<
    string,
    {
      instantiation: UndoRedoBase
      lastState: string | undefined
    }
  > = new Map()

  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService readonly keybinding: KeybindingService,
    @IEventbusService private readonly eventbus: EventbusService,
    @IWorkspacesService private readonly workspacesService: WorkspacesService,
    @IUndoRedoService private readonly undoRedoService: UndoRedoService,
  ) {
    super()

    // 快捷键
    keybinding.bind('mod+z', () => {
      undoRedoService.undo()
    })
    keybinding.bind(['mod+y', 'mod+shift+z'], () => {
      undoRedoService.redo()
    })

    this.canvasEvents = {
      // 元素改变后保存状态
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

  private saveDispose: IDisposable | undefined

  // todo jsondiffpatch https://github.com/benjamine/jsondiffpatch
  public saveState = debounce(() => {
    const pageId = this.pageId
    this.saveDispose?.dispose()
    this.saveDispose = runWhenIdle(() => {
      if (pageId !== this.pageId) return
      const undoRedo = this.getUndoRedo()
      if (!undoRedo || !undoRedo.instantiation.isTracking) return
      this.push(undoRedo.lastState)
      undoRedo.lastState = this.getJson()
      // 添加命令
      this.undoRedoService.add(new SaveStateCommand(this.workspacesService, this, pageId))
    })
  }, 300)

  // 工作区 | 页面管理
  private initWorkspace() {
    const currentId = this.workspacesService.getCurrentId()
    this.workspacesService.all().forEach((workspace) => {
      this.undoRedos.set(workspace.id, {
        instantiation: new UndoRedoBase(),
        lastState: this.pageId === currentId ? this.getJson() : undefined,
      })
    })
    this.eventbus.on('workspaceAddAfter', ({ newId }) => {
      this.undoRedos.set(newId, {
        instantiation: new UndoRedoBase(),
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
    // 解绑事件绑定
    this.keybinding.unbind(['mod+z', 'mod+y', 'mod+shift+z'])
    this.canvas.off(this.canvasEvents)
  }
}
