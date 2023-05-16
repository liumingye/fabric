import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { UndoRedo } from '@/core/undoRedo/undoRedo'
import { KeybindingService, IKeybindingService } from '@/core/keybinding/keybindingService'
import { createDecorator } from '@/core/instantiation/instantiation'

export const IUndoRedoService = createDecorator<UndoRedoService>('undoRedoService')

export class UndoRedoService extends UndoRedo {
  private lastState

  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService readonly keybindingServices: KeybindingService,
  ) {
    super()

    this.lastState = this.getJson()

    keybindingServices.bind('mod+z', this.undo.bind(this))
    keybindingServices.bind(['mod+y', 'mod+shift+z'], this.redo.bind(this))

    canvas.on('object:added', this.saveState.bind(this))
    canvas.on('object:modified', this.saveState.bind(this))
    canvas.on('object:removed', this.saveState.bind(this))
  }

  public redo() {
    if (!this.canRedo) return
    this.lastState = super.redo(this.lastState)
    this.loadJson(this.lastState)
  }

  public undo() {
    if (!this.canUndo) return
    this.lastState = super.undo(this.lastState)
    this.loadJson(this.lastState)
  }

  private async loadJson(json: string) {
    try {
      this.pause()
      await this.canvas.loadFromJSON(json)
    } finally {
      this.canvas.renderAll()
      this.resume()
    }
  }

  private getJson() {
    return this.canvas.toObject(['id', 'name'])
  }

  public saveState() {
    // todo jsondiffpatch https://github.com/benjamine/jsondiffpatch
    if (!this.isTracking) return
    this.push(this.lastState)
    this.lastState = this.getJson()
  }
}
