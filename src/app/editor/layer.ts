import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IKeybindingService, KeybindingService } from '@/core/keybinding/keybindingService'
import { ActiveSelection, Canvas, FabricObject, Group, StaticCanvas, util } from '@fabric'
import { AlignMethod } from 'app'
import { useEditor } from '@/app'
import { Disposable } from '@/utils/lifecycle'

export class Layer extends Disposable {
  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService private readonly KeybindingService: KeybindingService,
  ) {
    super()
    this.KeybindingService.bind(['delete', 'backspace'], () => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      this.deleteLayer(this.getObjects(activeObject))
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

    // 创建分组
    this.KeybindingService.bind('mod+g', (e) => {
      e.preventDefault?.()
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      const objects = this.getObjects(activeObject)
      // 获取要插入的分组，在deleteLayer前获取，不然获取不到
      const insertGroup = objects[0].getParent()
      const index = insertGroup._objects.indexOf(objects[0])
      // 创建组
      // 不能直接 new Group(this.deleteLayer(objects))，objects有组的话x和y会偏移
      const group = new Group()
      group.add(...this.deleteLayer(objects))
      insertGroup.insertAt(index, group)
      // 设置激活对象
      canvas.setActiveObject(group)
    })

    //解除分组
    this.KeybindingService.bind('mod+shift+g', (e) => {
      e.preventDefault?.()
      const activeObject = canvas.getActiveObject()
      if (!activeObject || !util.isCollection(activeObject)) return
      const parentGroup = activeObject.getParent()
      const objects = this.getObjects(activeObject)
      const index = parentGroup._objects.indexOf(activeObject)
      // 移除组
      parentGroup.remove(activeObject)
      parentGroup.insertAt(index, ...this.deleteLayer(objects))
      // 设置激活对象
      canvas.setActiveObjects(objects)
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

  private getObjects(target: FabricObject) {
    return util.isCollection(target) ? target.getObjects() : [target]
  }

  private objForEach(target: FabricObject, fn: (obj: FabricObject) => void, reverse = false) {
    const objects = this.getObjects(target)
    if (reverse) {
      objects.reverse()
    }
    const length = objects.length - 1
    for (let i = length; i >= 0; i--) {
      fn(objects[length - i])
    }
    // objects.forEach((obj) => fn(obj))
  }

  private deleteLayer(objects: FabricObject[]): FabricObject[] {
    return objects.flatMap((obj) => obj.getParent().remove(obj) as FabricObject[])
  }
}
