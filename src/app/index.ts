import { IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IUndoRedoService } from '@/core/undoRedo/undoRedoService'
import { IKeybindingService } from '@/core/keybinding/keybindingService'
import { IEventbusService } from '@/core/eventbus/eventbusService'
import { getActiveCore } from '@/core/root'

export const useEditor = () => {
  const core = getActiveCore()
  return core.app.editor.service.invokeFunction((accessor) => {
    return {
      editor: core.app.editor,
      canvas: accessor.get(IFabricCanvas),
      keybinding: accessor.get(IKeybindingService),
      undoRedo: accessor.get(IUndoRedoService),
      event: accessor.get(IEventbusService),
    }
  })
}
