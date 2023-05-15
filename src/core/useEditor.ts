import { IFabricCanvas } from './canvas/fabricCanvas'
import { IKeybindingService } from './keybinding/keybindingService'
import { getActiveEditor } from './rootEditor'
import { IUndoRedoService } from './undoRedo/undoRedoService'

export const useEditor = () => {
  return getActiveEditor()
}

export const useEditorServices = () => {
  return getActiveEditor().service.invokeFunction((accessor) => {
    return {
      canvas: accessor.get(IFabricCanvas),
      keybinding: accessor.get(IKeybindingService),
      undoRedo: accessor.get(IUndoRedoService),
    }
  })
}
