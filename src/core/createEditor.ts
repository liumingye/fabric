import { EditorMain } from '@/core/editor/editorMain'
import { getSingletonServiceDescriptors } from '@/core/instantiation/extensions'
import { IInstantiationService, ServiceIdentifier } from '@/core/instantiation/instantiation'
import { InstantiationService } from '@/core/instantiation/instantiationService'
import { ServiceCollection } from '@/core/instantiation/serviceCollection'
import { App } from 'vue'
import { FabricCanvas, IFabricCanvas } from './canvas/fabricCanvas'
import { SyncDescriptor } from './instantiation/descriptors'
import { IKeybindingService, KeybindingService } from './keybinding/keybindingService'
import { setActiveEditor } from './rootEditor'
import { IEditor, IEditorPluginContext } from './types'

const createServices = (): [IInstantiationService] => {
  const services = new ServiceCollection()

  // 收集依赖服务
  for (const [id, descriptor] of getSingletonServiceDescriptors()) {
    services.set(id, descriptor)
  }

  // 收集依赖服务
  const define = <T>(id: ServiceIdentifier<T>, ctor: new (...args: any[]) => T) => {
    if (!services.has(id)) {
      services.set(id, new SyncDescriptor(ctor))
    }
  }
  define(IFabricCanvas, FabricCanvas)
  define(IKeybindingService, KeybindingService)

  return [new InstantiationService(services, true)]
}

export const createEditor = (): IEditor => {
  const _p = new Map<symbol, IEditorPluginContext>()

  const [mainInstantiationService] = createServices()

  const editor: IEditor = markRaw({
    install(app: App) {
      setActiveEditor(editor)
      editor._a = app
      // 创建编辑器实例
      mainInstantiationService.createInstance(new SyncDescriptor(EditorMain))
    },
    use(plugin) {
      const pluginInstance = plugin(this) as IEditorPluginContext
      pluginInstance._id = Symbol()
      _p.set(pluginInstance._id, pluginInstance)
      // todo 插件管理和生命周期
      pluginInstance.setup?.()
      return this
    },
    service: mainInstantiationService,
    _p,
    // @ts-expect-error
    _a: null,
  })

  return editor
}
