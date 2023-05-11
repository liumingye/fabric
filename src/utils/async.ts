/**
 * A disposable object
 */
interface IDisposable {
  dispose(): void
}

/**
 * Execute the callback the next time the browser is idle
 */
export let runWhenIdle: (callback: (idle: IdleDeadline) => void, timeout?: number) => IDisposable

/**
 * An implementation of the "idle-until-urgent"-strategy as introduced
 * here: https://philipwalton.com/articles/idle-until-urgent/
 */
export class IdleValue<T> {
  private readonly _executor: () => void
  private readonly _handle: IDisposable

  private _didRun = false
  private _value?: T
  private _error: unknown

  constructor(executor: () => T) {
    this._executor = () => {
      try {
        this._value = executor()
      } catch (err) {
        this._error = err
      } finally {
        this._didRun = true
      }
    }
    this._handle = runWhenIdle(() => this._executor())
  }

  dispose(): void {
    this._handle.dispose()
  }

  get value(): T {
    if (!this._didRun) {
      this._handle.dispose()
      this._executor()
    }
    if (this._error) {
      throw this._error
    }
    return this._value!
  }

  get isInitialized(): boolean {
    return this._didRun
  }
}

//#endregion
