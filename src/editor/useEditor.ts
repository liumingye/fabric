import { getActiveEditor } from './rootEditor'

export const useEditor = () => {
  return getActiveEditor()
}

export const useEditorServices = () => {
  return getActiveEditor().service
}
