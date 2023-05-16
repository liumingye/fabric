import type { App } from 'vue'
import type { IInstantiationService } from './instantiation/instantiation'
import type { EditorMain } from '@/app/editor'

export interface IEditorPluginContext extends EditorPluginContext {
  _id: symbol
}

export interface EditorPluginContext {
  setup?: () => void
  dispose?: () => void
}

export type EditorPlugin = (editor: Pick<EditorMain, 'service' | 'use'>) => EditorPluginContext

export interface ICoreApp {
  editor: EditorMain
}

export interface ICore {
  install: (app: App) => void
  service: IInstantiationService
  use: (plugin: EditorPlugin) => ICore
  app: ICoreApp
  _p: EditorPlugin[]
  _a: App
}
