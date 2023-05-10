import type { App } from 'vue'
import type { loadModules } from './createEditor'

export interface Editor {
  install: (app: App) => void
  loadedModules: ReturnType<typeof loadModules>
  _a: App
}

export interface EditorPlugin {
  setup: () => void
}
