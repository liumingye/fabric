import { Disposable } from '@/utils/lifecycle'
import { IInstantiationService } from '@/core/instantiation/instantiation'

export abstract class BaseApp extends Disposable {
  public abstract service: IInstantiationService

  public abstract startup(): void
}
