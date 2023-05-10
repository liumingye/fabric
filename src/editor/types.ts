import type { App } from 'vue'
import type { FabricCanvas } from './canvas/canvas'
import type { KeybindingService } from './keybinding/keybindingService'

export interface EditorService {
  canvas: FabricCanvas
  keybinding: KeybindingService
}

export interface Editor {
  install: (app: App) => void
  service: EditorService
  use: (plugin: EditorPlugin) => Editor
  _p: Map<symbol, IEditorPluginContext>
  _a: App
}

// 插件用类型
export interface EditorPluginContext {
  setup(): void
}

// 内部类型
export interface IEditorPluginContext extends EditorPluginContext {
  _id: symbol
}

export type EditorPlugin = (editor: Editor) => EditorPluginContext
