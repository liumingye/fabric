import { FabricCanvas, IFabricCanvas } from './canvas/fabricCanvas'
import { KeybindingService } from './keybinding/keybindingService'
import { setActiveEditor } from './rootEditor'
import { IEditor, IEditorPluginContext } from './types'
import { App } from 'vue'
import { ServiceCollection } from '@/editor/instantiation/serviceCollection'
import { InstantiationService } from '@/editor/instantiation/instantiationService'
import { IInstantiationService } from '@/editor/instantiation/instantiation'
import { SyncDescriptor } from './instantiation/descriptors'

const createServices = (): [IInstantiationService, FabricCanvas] => {
  const services = new ServiceCollection()
  const canvas = new FabricCanvas()
  services.set(IFabricCanvas, canvas)
  return [new InstantiationService(services, true), canvas]
}

export const createEditor = (): IEditor => {
  const _p = new Map<symbol, IEditorPluginContext>()

  const [mainInstantiationService, canvas] = createServices()
  const keybinding = mainInstantiationService.createInstance<KeybindingService>(
    new SyncDescriptor(KeybindingService),
  )

  const editor: IEditor = markRaw({
    install(app: App) {
      setActiveEditor(editor)
      editor._a = app
      _p.forEach((extender) => {
        extender.setup?.()
      })
    },
    use(plugin) {
      const pluginInstance = plugin(this) as IEditorPluginContext
      pluginInstance._id = Symbol()
      _p.set(pluginInstance._id, pluginInstance)
      return this
    },
    get service() {
      return {
        canvas,
        keybinding,
      }
    },
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
