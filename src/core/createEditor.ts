import { FabricCanvas, IFabricCanvas } from './canvas/fabricCanvas'
import { HoverObjectBorder } from './canvas/enhancements/hoverObjectBorder'
import { HandleWheelScroll } from './canvas/enhancements/handleWheelScroll'
import { FabricTool } from './canvas/fabricTool'
import { KeybindingService, IKeybindingServices } from './keybinding/keybindingService'
import { setActiveEditor } from './rootEditor'
import { IEditor, IEditorPluginContext } from './types'
import { App } from 'vue'
import { ServiceCollection } from '@/core/instantiation/serviceCollection'
import { InstantiationService } from '@/core/instantiation/instantiationService'
import { IInstantiationService } from '@/core/instantiation/instantiation'
import { SyncDescriptor } from './instantiation/descriptors'

const createServices = (): [IInstantiationService, FabricCanvas, KeybindingService] => {
  const services = new ServiceCollection()
  // 收集依赖
  const canvas = new FabricCanvas()
  services.set(IFabricCanvas, canvas)
  const keybinding = new KeybindingService(canvas)
  services.set(IKeybindingServices, keybinding)
  return [new InstantiationService(services, true), canvas, keybinding]
}

export const createEditor = (): IEditor => {
  const _p = new Map<symbol, IEditorPluginContext>()

  const [mainInstantiationService] = createServices()

  const editor: IEditor = markRaw({
    install(app: App) {
      setActiveEditor(editor)
      editor._a = app

      // 注册实例
      mainInstantiationService.createInstance(new SyncDescriptor(FabricTool))
      mainInstantiationService.createInstance(new SyncDescriptor(HoverObjectBorder))
      mainInstantiationService.createInstance(new SyncDescriptor(HandleWheelScroll))
      console.log(2)
    },
    use(plugin) {
      console.log(1)
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

// const a = mainInstantiationService.invokeFunction(function (accessor, b) {
//   console.log(accessor.get(IFabricCanvas), b)
//   return accessor.get(IFabricCanvas)
// }, 12)
// console.log(a)
// export class StandaloneKeybindingService {}
// registerSingleton(IKeybindingServices, StandaloneKeybindingService)
