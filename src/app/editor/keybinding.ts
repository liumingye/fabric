import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IKeybindingService, KeybindingService } from '@/core/keybinding/keybindingService'
import { ActiveSelection, FabricObject } from '@fabric'
import { AlignMethod } from 'app'
import { useEditor } from '@/app'

export class Keybinding {
  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService private readonly KeybindingService: KeybindingService,
  ) {
    this.KeybindingService.bind(['delete', 'backspace'], () => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      this.objForEach(activeObject, (obj) => {
        const group = obj.getParent()
        group.remove(obj)
      })
      canvas.discardActiveObject()
      canvas.requestRenderAll()
    })

    // 移至底层
    this.KeybindingService.bind('[', () => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      this.objForEach(
        activeObject,
        (obj) => {
          const group = obj.getParent()
          group.sendObjectToBack(obj)
          useEditor().undoRedo.saveState()
        },
        true,
      )
    })

    // 移至顶层
    this.KeybindingService.bind(']', () => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      this.objForEach(activeObject, (obj) => {
        const group = obj.getParent()
        group.bringObjectToFront(obj)
        useEditor().undoRedo.saveState()
      })
    })

    // 向下移动一层
    this.KeybindingService.bind('mod+[', () => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      const isActiveSelection = activeObject instanceof ActiveSelection
      this.objForEach(activeObject, (obj) => {
        const group = obj.getParent()
        // 排除已经在最底层的元素
        if (
          isActiveSelection &&
          group._objects.indexOf(obj) === activeObject._objects.indexOf(obj)
        ) {
          return
        }
        group.sendObjectBackwards(obj)
        useEditor().undoRedo.saveState()
      })
    })

    // 向上移动一层
    this.KeybindingService.bind('mod+]', () => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      const isActiveSelection = activeObject instanceof ActiveSelection
      this.objForEach(
        activeObject,
        (obj) => {
          const group = obj.getParent()
          // 排除已经在最顶层的元素
          if (
            isActiveSelection &&
            group._objects.indexOf(obj) + activeObject._objects.length ===
              activeObject._objects.indexOf(obj) + group._objects.length
          ) {
            return
          }
          group.bringObjectForward(obj)
          useEditor().undoRedo.saveState()
        },
        true,
      )
    })

    this.bindAlign()
  }

  private bindAlign() {
    const align = (method: AlignMethod) => {
      const activeObject = this.canvas.getActiveObject()
      if (!activeObject) return
      activeObject[method]()
      useEditor().undoRedo.saveState()
    }
    this.KeybindingService.bind({
      'alt+a': () => align('alignLeft'),
      'alt+d': () => align('alignRight'),
      'alt+h': () => align('alignCenter'),
      'alt+w': () => align('verticalTop'),
      'alt+s': () => align('verticalBottom'),
      'alt+v': () => align('verticalMiddle'),
    })
  }

  private objForEach(target: FabricObject, fn: (obj: FabricObject) => void, reverse = false) {
    const objects = target instanceof ActiveSelection ? target.getObjects().slice(0) : [target]
    if (reverse) {
      objects.reverse()
    }
    const length = objects.length - 1
    for (let i = length; i >= 0; i--) {
      fn(objects[length - i])
    }
    // objects.forEach((obj) => fn(obj))
  }
}
