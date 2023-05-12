import type { App } from 'vue'
import type { IInstantiationService } from './instantiation/instantiation'

// 内部类型
export interface IEditor extends Editor {
  install: (app: App) => void
}

export interface IEditorPluginContext extends EditorPluginContext {
  _id: symbol
}

// 插件用类型
export type Editor = {
  use: (plugin: EditorPlugin) => Editor
  service: IInstantiationService
  _p: Map<symbol, IEditorPluginContext>
  _a: App
}

export interface EditorPluginContext {
  setup?: () => void
  dispose?: () => void
}

export type EditorPlugin = (editor: Editor) => EditorPluginContext
