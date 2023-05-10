import { FabricCanvas } from './canvas/canvas'
import { KeybindingService } from './keybinding/keybindingService'
import { setActiveEditor } from './rootEditor'
import { Editor, IEditorPluginContext } from './types'
import { Container } from './container'
import { App } from 'vue'
import { myPlugin } from './testPlugin/index'

export const registerService = (container: Container) => {
  container.register('canvas', FabricCanvas)
  container.register('keybinding', KeybindingService, ['canvas'])
}

export const createEditor = (): Editor => {
  const _p = new Map<symbol, IEditorPluginContext>()

  const container = new Container()

  const editor: Editor = markRaw({
    install(app: App) {
      setActiveEditor(editor)
      editor._a = app
      registerService(container)
      _p.forEach((extender) => {
        extender.setup()
      })
      // app.provide('editor', editor.service)
    },
    use(plugin) {
      const pluginInstance = plugin(this) as IEditorPluginContext
      pluginInstance._id = Symbol()
      _p.set(pluginInstance._id, pluginInstance)
      return this
    },
    get service() {
      return {
        canvas: container.resolve('canvas'),
        keybinding: container.resolve('keybinding'),
      }
    },
    _p,
    // @ts-expect-error
    _a: null,
  })

  // debug code
  editor.use(myPlugin)

  return editor
}
