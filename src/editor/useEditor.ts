import { getActiveEditor } from './rootEditor'

export const useEditor = () => {
  return getActiveEditor()
}

export const useEditorModules = () => {
  return getActiveEditor().loadedModules
}
