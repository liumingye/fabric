import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IUndoRedoService, UndoRedoService } from '@/core/undoRedo/undoRedoService'
import { KeybindingService, IKeybindingService } from '@/core/keybinding/keybindingService'

export class UndoRedo {
  private lastState

  constructor(
    @IFabricCanvas private canvas: FabricCanvas,
    @IUndoRedoService private undoRedoService: UndoRedoService,
    @IKeybindingService keybindingServices: KeybindingService,
  ) {
    this.lastState = this.getJson()

    keybindingServices.bind('mod+z', this.undo.bind(this))
    keybindingServices.bind(['mod+y', 'mod+shift+z'], this.redo.bind(this))

    canvas.on('object:added', this.saveState.bind(this))
    canvas.on('object:modified', this.saveState.bind(this))
    canvas.on('object:removed', this.saveState.bind(this))
  }

  private redo() {
    if (!this.undoRedoService.canRedo) return
    this.lastState = this.undoRedoService.redo(this.lastState)
    this.loadJson(this.lastState)
  }

  private undo() {
    if (!this.undoRedoService.canUndo) return
    this.lastState = this.undoRedoService.undo(this.lastState)
    this.loadJson(this.lastState)
  }

  private async loadJson(json: string) {
    try {
      this.undoRedoService.pause()
      await this.canvas.loadFromJSON(json)
    } finally {
      this.canvas.renderAll()
      this.undoRedoService.resume()
    }
  }

  private getJson() {
    return this.canvas.toObject(['id', 'name'])
  }

  private saveState() {
    // todo jsondiffpatch https://github.com/benjamine/jsondiffpatch
    if (!this.undoRedoService.isTracking) return
    this.undoRedoService.push(this.lastState)
    this.lastState = this.getJson()
  }
}
