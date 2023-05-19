import { FabricTool } from '@/app/editor/fabricTool'
import { HoverObjectBorder } from '@/app/editor/hoverObjectBorder'
import { HandleWheelScroll } from '@/app/editor/handleWheelScroll'
import { GuideLines } from '@/app/editor/guideLines'
import { Keybinding } from '@/app/editor/keybinding'
import { SyncDescriptor } from '@/core/instantiation/descriptors'
import { IInstantiationService, ServiceIdentifier } from '@/core/instantiation/instantiation'
import { ServiceCollection } from '@/core/instantiation/serviceCollection'
import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IUndoRedoService, UndoRedoService } from '@/core/undoRedo/undoRedoService'
import { EditorPlugin, IEditorPluginContext, getActiveCore } from '@/core'

export class EditorMain {
  public service
  private pluginInstance = new Map<Symbol, IEditorPluginContext>()

  constructor(@IInstantiationService private readonly instantiationService: IInstantiationService) {
    this.service = this.initServices()
  }

  public startup() {
    const register = <T>(ctor: new (...args: any[]) => T): T => {
      return this.service.createInstance(new SyncDescriptor(ctor))
    }
    register(Keybinding)
    register(FabricTool)
    register(HoverObjectBorder)
    register(HandleWheelScroll)
    register(GuideLines)

    const core = getActiveCore()
    core._p.forEach((plugin) => {
      this.use(plugin)
    })
  }

  public use(plugin: EditorPlugin) {
    const instance = plugin({
      service: this.service,
      use: this.use,
    }) as IEditorPluginContext
    const id = Symbol()
    instance._id = id
    instance.setup?.()
    this.pluginInstance.set(id, instance)
  }

  private initServices() {
    const services = new ServiceCollection()

    const define = <T>(id: ServiceIdentifier<T>, ctor: new (...args: any[]) => T) => {
      if (!services.has(id)) {
        services.set(id, new SyncDescriptor(ctor))
      }
    }
    define(IFabricCanvas, FabricCanvas)
    define(IUndoRedoService, UndoRedoService)

    return this.instantiationService.createChild(services)
  }
}
