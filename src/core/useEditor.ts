import { IFabricCanvas } from './canvas/fabricCanvas'
import { IKeybindingService } from './keybinding/keybindingService'
import { getActiveEditor } from './rootEditor'

export const useEditor = () => {
  return getActiveEditor()
}

export const useEditorServices = () => {
  return getActiveEditor().service.invokeFunction((accessor) => {
    return {
      canvas: accessor.get(IFabricCanvas),
      keybinding: accessor.get(IKeybindingService),
    }
  })
}
