import { IFabricCanvas } from './canvas/fabricCanvas'
import { IKeybindingServices } from './keybinding/keybindingService'
import { getActiveEditor } from './rootEditor'

export const useEditor = () => {
  return getActiveEditor()
}

export const useEditorServices = () => {
  return getActiveEditor().service.invokeFunction((accessor) => {
    return {
      canvas: accessor.get(IFabricCanvas),
      keybinding: accessor.get(IKeybindingServices),
    }
  })
}
