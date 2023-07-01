import { IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IEditorUndoRedoService } from '@/app/editor/undoRedo/undoRedoService'
import { IKeybindingService } from '@/core/keybinding/keybindingService'
import { IEventbusService } from '@/core/eventbus/eventbusService'
import { IWorkspacesService } from '@/core/workspaces/workspacesService'
import { EditorMain } from '@/app/editor'

export interface ICoreApp {
  editor: EditorMain
}

export const appInstance: ICoreApp = {
  editor: null!,
}

export const useEditor = () => {
  if (!appInstance.editor) {
    console.warn('app is not ready')
    return undefined!
  }
  return appInstance.editor.service.invokeFunction((accessor) => {
    return {
      canvas: accessor.get(IFabricCanvas),
      keybinding: accessor.get(IKeybindingService),
      undoRedo: accessor.get(IEditorUndoRedoService),
      event: accessor.get(IEventbusService),
      workspaces: accessor.get(IWorkspacesService),
    }
  })
}
