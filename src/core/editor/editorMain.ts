import { FabricTool } from '@/core/editor/fabricTool'
import { HoverObjectBorder } from '@/core/editor/hoverObjectBorder'
import { HandleWheelScroll } from '@/core/editor/handleWheelScroll'
import { Keybinding } from '@/core/editor/keybinding'
import { UndoRedo } from '@/core/editor/undoRedo'
import { SyncDescriptor } from '@/core/instantiation/descriptors'
import { IInstantiationService } from '@/core/instantiation/instantiation'
import { InstantiationService } from '@/core/instantiation/instantiationService'

export class EditorMain {
  constructor(@IInstantiationService instantiationService: InstantiationService) {
    const register = <T>(ctor: new (...args: any[]) => T) => {
      return instantiationService.createInstance(new SyncDescriptor(ctor))
    }

    register(Keybinding)
    register(FabricTool)
    register(HoverObjectBorder)
    register(HandleWheelScroll)
    register(UndoRedo)
  }
}
