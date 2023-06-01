import { FabricTool } from '@/app/editor/fabricTool'
import { HoverObjectBorder } from '@/app/editor/hoverObjectBorder'
import { HandleWheelScroll } from '@/app/editor/handleWheelScroll'
import { Clipboard } from '@/app/editor/clipboard'
import { Layer } from '@/app/editor/layer'
import { Ruler } from '@/app/editor/ruler'
import { ContextMenu } from '@/app/editor/contextMenu'
import { Zoom } from '@/app/editor/zoom'
import { GuideLines } from '@/app/editor/guideLines'
import { SyncDescriptor } from '@/core/instantiation/descriptors'
import { IInstantiationService, ServiceIdentifier } from '@/core/instantiation/instantiation'
import { ServiceCollection } from '@/core/instantiation/serviceCollection'
import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IUndoRedoService, UndoRedoService } from '@/core/undoRedo/undoRedoService'
import { EditorPlugin, IEditorPluginContext, getActiveCore } from '@/core'
import { Disposable } from '@/utils/lifecycle'
import { IKeybindingService } from '@/core/keybinding/keybindingService'
import { IWorkspacesService, WorkspacesService } from '@/core/workspaces/workspacesService'

export class EditorMain extends Disposable {
  public service: IInstantiationService
  private scope = effectScope()
  private pluginInstance = new Map<Symbol, IEditorPluginContext>()

  constructor(@IInstantiationService private readonly instantiationService: IInstantiationService) {
    super()
    this.service = instantiationService
  }

  public startup() {
    this.scope.run(() => {
      this.service = this.initServices()
      this.service.invokeFunction((accessor) => {
        const workspacesService = accessor.get(IWorkspacesService)
        if (workspacesService.all().length === 0) {
          workspacesService.setCurrentId(workspacesService.add('页面 1'))
        }
      })
      const instances = [
        this.service.createInstance(Ruler),
        this.service.createInstance(Layer),
        this.service.createInstance(FabricTool),
        this.service.createInstance(HoverObjectBorder),
        this.service.createInstance(HandleWheelScroll),
        this.service.createInstance(GuideLines),
        this.service.createInstance(Zoom),
        this.service.createInstance(ContextMenu),
        this.service.createInstance(Clipboard),
      ]
      instances.forEach((instance) => {
        this._register(instance)
      })
      const core = getActiveCore()
      core._p.forEach((plugin) => {
        this.use(plugin)
      })
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
    define(IWorkspacesService, WorkspacesService)
    define(IFabricCanvas, FabricCanvas)
    define(IUndoRedoService, UndoRedoService)

    return this.instantiationService.createChild(services)
  }

  public dispose() {
    try {
      this.scope.stop()
      this.pluginInstance.forEach((p) => {
        p.dispose?.()
      })
      this.service.invokeFunction((accessor) => {
        accessor.get(IKeybindingService).reset()
        accessor.get(IFabricCanvas).destroy()
        accessor.get(IUndoRedoService).reset()
      })
    } catch (_e) {
      console.error(_e)
    }
  }
}
