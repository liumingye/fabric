import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { UndoRedo } from '@/core/undoRedo/undoRedo'
import { KeybindingService, IKeybindingService } from '@/core/keybinding/keybindingService'
import { EventbusService, IEventbusService } from '@/core/eventbus/eventbusService'
import { createDecorator } from '@/core/instantiation/instantiation'

export const IUndoRedoService = createDecorator<UndoRedoService>('undoRedoService')

export class UndoRedoService extends UndoRedo {
  private lastState

  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService readonly keybindingServices: KeybindingService,
    @IEventbusService private readonly eventbusService: EventbusService,
  ) {
    super()

    this.lastState = this.getJson()

    keybindingServices.bind('mod+z', this.undo.bind(this))
    keybindingServices.bind(['mod+y', 'mod+shift+z'], this.redo.bind(this))

    canvas.on('object:modified', this.saveState.bind(this))
  }

  public push(state: any) {
    super.push(state)
    this.eventbusService.emit('undoRedoStackChange')
  }

  public redo() {
    if (!this.canRedo) return
    this.lastState = super.redo(this.lastState)
    if (this.lastState) {
      this.loadJson(this.lastState)
      this.eventbusService.emit('undoRedoStackChange')
    }
    return this.lastState
  }

  public undo() {
    if (!this.canUndo) return
    this.lastState = super.undo(this.lastState)
    if (this.lastState) {
      this.loadJson(this.lastState)
      this.eventbusService.emit('undoRedoStackChange')
    }
    return this.lastState
  }

  public reset() {
    super.reset()
    this.eventbusService.emit('undoRedoStackChange')
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
    return this.canvas.toObject()
  }

  public saveState() {
    // todo jsondiffpatch https://github.com/benjamine/jsondiffpatch
    if (!this.isTracking) return
    this.push(this.lastState)
    this.lastState = this.getJson()
  }
}
