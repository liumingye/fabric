import { registerSingleton } from '@/core/instantiation/extensions'
import { createDecorator } from '@/core/instantiation/instantiation'

export const IUndoRedoService = createDecorator<UndoRedoService>('undoRedoService')

class UndoQueue {
  private inner_: any[] = []
  private size_ = 50

  pop() {
    return this.inner_.pop()
  }

  push(e: any) {
    this.inner_.push(e)
    while (this.length > this.size_) {
      this.inner_.splice(0, 1)
    }
  }

  get length(): number {
    return this.inner_.length
  }
}

export class UndoRedoService {
  private undoStates: UndoQueue = new UndoQueue()
  private redoStates: UndoQueue = new UndoQueue()
  // private eventEmitter: any = new EventEmitter()
  private isUndoing = false
  public isTracking = true

  constructor() {
    this.push = this.push.bind(this)
  }

  pause() {
    this.isTracking = false
  }

  resume() {
    this.isTracking = true
  }

  // on(eventName: string, callback: Function) {
  //   return this.eventEmitter.on(eventName, callback)
  // }

  // off(eventName: string, callback: Function) {
  //   return this.eventEmitter.removeListener(eventName, callback)
  // }

  push(state: any) {
    if (!this.isTracking) return
    this.undoStates.push(state)
    this.redoStates = new UndoQueue()
    // this.eventEmitter.emit('stackChange')
  }

  undo(redoState: any) {
    if (this.isUndoing) return
    if (!this.canUndo) throw new Error('Nothing to undo')
    this.isUndoing = true
    const state = this.undoStates.pop()
    this.redoStates.push(redoState)
    // this.eventEmitter.emit('stackChange')
    this.isUndoing = false
    return state
  }

  redo(undoState: any) {
    if (this.isUndoing) return
    if (!this.canRedo) throw new Error('Nothing to redo')
    this.isUndoing = true
    const state = this.redoStates.pop()
    this.undoStates.push(undoState)
    // this.eventEmitter.emit('stackChange')
    this.isUndoing = false
    return state
  }

  reset() {
    this.undoStates = new UndoQueue()
    this.redoStates = new UndoQueue()
    this.isUndoing = false
    // this.eventEmitter.emit('stackChange')
  }

  get canUndo(): boolean {
    return !!this.undoStates.length
  }

  get canRedo(): boolean {
    return !!this.redoStates.length
  }
}

registerSingleton(IUndoRedoService, UndoRedoService)
