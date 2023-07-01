import { createDecorator } from '@/core/instantiation/instantiation'
import { registerSingleton, InstantiationType } from '@/core/instantiation/extensions'
import { UndoRedoCommand } from '@/core/undoRedo/commands'

export const IUndoRedoService = createDecorator<UndoRedoService>('undoRedoService')

export class UndoRedoService {
  declare readonly _serviceBrand: undefined

  private _stack: UndoRedoCommand[] = []
  private _stackIndex = -1

  public canUndo(): boolean {
    return this._stackIndex > 0
  }

  public canRedo(): boolean {
    return this._stackIndex < this._stack.length && this._stack.length > 0
  }

  public clear(): void {
    this._stack = []
    this._stackIndex = -1
  }

  public add(cmd: UndoRedoCommand): void {
    if (this.canRedo()) {
      this._stack.splice(this._stackIndex, this._stack.length)
    }
    this._stack.push(cmd)
    this._stackIndex = this._stack.length
  }

  public undo(): void {
    if (this.canUndo()) {
      this._stackIndex--
      this._stack[this._stackIndex].undo()
    }
  }

  public redo(): void {
    if (this.canRedo()) {
      this._stack[this._stackIndex].redo()
      this._stackIndex++
    }
  }
}

registerSingleton(IUndoRedoService, UndoRedoService, InstantiationType.Eager)
