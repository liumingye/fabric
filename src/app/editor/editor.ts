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
import {
  IEditorUndoRedoService,
  EditorUndoRedoService,
} from '@/app/editor/undoRedo/undoRedoService'
import { IUndoRedoService } from '@/core/undoRedo/undoRedoService'
import { EditorPlugin, IEditorPluginContext, getActiveCore } from '@/core'
import { IKeybindingService, KeybindingService } from '@/core/keybinding/keybindingService'
import { IWorkspacesService, WorkspacesService } from '@/core/workspaces/workspacesService'
import { IEventbusService, EventbusService } from '@/core/eventbus/eventbusService'
import { BaseApp } from '@/app/baseApp'
import { UsableSolts } from '@/core/types'
import { toDisposable } from '@/utils/lifecycle'
import type { DefineComponent } from 'vue'
import { useEditor } from '@/app'
import { runWhenIdle } from '@/utils/async'

export class EditorMain extends BaseApp {
  public service!: IInstantiationService

  private readonly pluginInstance = new Map<Symbol, IEditorPluginContext>()

  public contextMenu: ContextMenu | undefined

  constructor(@IInstantiationService private readonly instantiationService: IInstantiationService) {
    super()
  }

  public startup() {
    super.scopeRun(() => {
      this.service = this.initServices()
      this.service.invokeFunction((accessor) => {
        const workspacesService = accessor.get(IWorkspacesService)
        if (workspacesService.size() === 0) {
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
        (this.contextMenu = this.service.createInstance(ContextMenu)),
        this.service.createInstance(Clipboard),
      ]
      instances.forEach((instance) => {
        this._register(instance)
      })

      // 插件载入
      provide('useEditor', useEditor)
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
    // 存储实例
    instance._id = Symbol()
    this.pluginInstance.set(instance._id, instance)
    // 生命周期
    runWhenIdle(() => {
      // 插件安装
      instance.setup?.()
      this._register(
        toDisposable(() => {
          // 插件销毁
          instance.dispose?.()
          this.pluginInstance.delete(instance._id)
        }),
      )
    })
  }

  private initServices() {
    const services = new ServiceCollection()

    const define = <T>(id: ServiceIdentifier<T>, ctor: new (...args: any[]) => T) => {
      if (!services.has(id)) {
        services.set(id, new SyncDescriptor(ctor))
      }
    }
    define(IEventbusService, EventbusService)
    define(IWorkspacesService, WorkspacesService)
    define(IFabricCanvas, FabricCanvas)
    define(IEditorUndoRedoService, EditorUndoRedoService)
    define(IKeybindingService, KeybindingService)

    return this.instantiationService.createChild(services)
  }

  public dispose() {
    try {
      provide('useEditor', undefined)
      super.dispose()
      this.service.invokeFunction((accessor) => {
        accessor.get(IKeybindingService).reset()
        accessor.get(IEditorUndoRedoService).reset()
        accessor.get(IUndoRedoService).clear()
        accessor.get(IFabricCanvas).dispose()
        accessor.get(IWorkspacesService).dispose()
        accessor.get(IEventbusService).all.clear()
      })
      this.service = undefined!
    } catch (_e) {
      console.error(_e)
    }
  }

  public getPluginSlots(name: UsableSolts) {
    const pluginSlots: DefineComponent<{}, {}, any>[] = []
    this.pluginInstance.forEach((plugin) => {
      if (!plugin.slots) return
      const slots = plugin.slots[name]
      slots && pluginSlots.push(...slots)
    })
    return pluginSlots
  }
}
