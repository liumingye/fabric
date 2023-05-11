import type { App } from 'vue'
import type { FabricCanvas } from './canvas/fabricCanvas'
import type { KeybindingService } from './keybinding/keybindingService'

// 内部类型
export interface IEditorService {
  canvas: FabricCanvas
  keybinding: KeybindingService
}

export interface IEditor extends Editor {
  install: (app: App) => void
  _p: Map<symbol, IEditorPluginContext>
  _a: App
}

export interface IEditorPluginContext extends EditorPluginContext {
  _id: symbol
}

// 插件用类型
export type Editor = {
  service: IEditorService
  use: (plugin: EditorPlugin) => Editor
}

export interface EditorPluginContext {
  setup?: () => void
  dispose?: () => void
}

export type EditorPlugin = (editor: Editor) => EditorPluginContext
