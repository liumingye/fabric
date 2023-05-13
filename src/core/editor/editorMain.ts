import { FabricTool } from '@/core/editor/fabricTool'
import { HoverObjectBorder } from '@/core/editor/hoverObjectBorder'
import { HandleWheelScroll } from '@/core/editor/handleWheelScroll'
import { UndoRedo } from '@/core/editor/undoRedo'
import { SyncDescriptor } from '@/core/instantiation/descriptors'
import { useEditor } from '@/core/useEditor'

export class EditorMain {
  constructor() {
    const mainInstantiationService = useEditor().service

    const register = <T>(ctor: new (...args: any[]) => T) => {
      mainInstantiationService.createInstance(new SyncDescriptor(ctor))
    }

    register(FabricTool)
    register(HoverObjectBorder)
    register(HandleWheelScroll)
    register(UndoRedo)
  }
}
