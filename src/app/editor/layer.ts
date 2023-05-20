import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IKeybindingService, KeybindingService } from '@/core/keybinding/keybindingService'
import { ActiveSelection, FabricObject, Group, util } from '@fabric'
import { AlignMethod } from 'app'
import { useEditor } from '@/app'
import { Disposable } from '@/utils/lifecycle'

export class Layer extends Disposable {
  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService private readonly KeybindingService: KeybindingService,
  ) {
    super()
    this.KeybindingService.bind(['delete', 'backspace'], (e) => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      e.preventDefault?.()
      this.deleteLayer(this.getObjects(activeObject))
      canvas.discardActiveObject()
      canvas.requestRenderAll()
    })

    // 移至底层
    this.KeybindingService.bind('[', (e) => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      e.preventDefault?.()
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
    this.KeybindingService.bind(']', (e) => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      e.preventDefault?.()
      this.objForEach(activeObject, (obj) => {
        const group = obj.getParent()
        group.bringObjectToFront(obj)
        useEditor().undoRedo.saveState()
      })
    })

    // 向下移动一层
    this.KeybindingService.bind('mod+[', (e) => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      e.preventDefault?.()
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
    this.KeybindingService.bind('mod+]', (e) => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      e.preventDefault?.()
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
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      e.preventDefault?.()
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
      const activeObject = canvas.getActiveObject()
      if (!activeObject || !util.isCollection(activeObject)) return
      e.preventDefault?.()
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
    const align = (e: KeyboardEvent, method: AlignMethod) => {
      const activeObject = this.canvas.getActiveObject()
      if (!activeObject) return
      e.preventDefault?.()
      activeObject[method]()
      useEditor().undoRedo.saveState()
    }
    this.KeybindingService.bind({
      'alt+a': (e) => align(e, 'alignLeft'),
      'alt+d': (e) => align(e, 'alignRight'),
      'alt+h': (e) => align(e, 'alignCenter'),
      'alt+w': (e) => align(e, 'verticalTop'),
      'alt+s': (e) => align(e, 'verticalBottom'),
      'alt+v': (e) => align(e, 'verticalMiddle'),
    })
  }

  /**
   * 获取激活选区或组内全部元素
   */
  private getObjects(target: FabricObject) {
    return util.isCollection(target) ? target.getObjects() : [target]
  }

  /**
   * 获取激活选区内全部元素
   */
  private getSelectionObjects(target: FabricObject) {
    return target instanceof ActiveSelection ? target.getObjects() : [target]
  }

  private objForEach(target: FabricObject, fn: (obj: FabricObject) => void, reverse = false) {
    // 不能用getObjects，不然激活元素为组无法进行图层移动
    const objects = this.getSelectionObjects(target)
    if (reverse) {
      objects.reverse()
    }
    const length = objects.length - 1
    for (let i = length; i >= 0; i--) {
      fn(objects[length - i])
    }
  }

  private deleteLayer(objects: FabricObject[]): FabricObject[] {
    return objects.flatMap((obj) => obj.getParent().remove(obj) as FabricObject[])
  }
}
