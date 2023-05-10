import { InstantiationCanvas } from './instantiation/instantiationCanvas'
import { InstantiationMousetrap } from './instantiation/instantiationMousetrap'
import { setActiveEditor } from './rootEditor'
import { Editor, EditorPlugin } from './types'
import { App } from 'vue'

export const loadModules = () => {
  const canvas = new InstantiationCanvas()
  return {
    canvas,
    mousetrap: new InstantiationMousetrap(canvas),
  }
}

export const createEditor = (): Editor => {
  const _p: EditorPlugin[] = []
  const editor: Editor = markRaw({
    install(app: App) {
      setActiveEditor(editor)
      editor._a = app
    },
    use(plugin: EditorPlugin) {
      _p.push(plugin)
      return this
    },
    loadedModules: loadModules(),
    _p: null,
    // @ts-expect-error
    _a: null,
  })

  return editor
}
