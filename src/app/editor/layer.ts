import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IKeybindingService, KeybindingService } from '@/core/keybinding/keybindingService'
import { Board, FabricObject, Group, util } from '@fabric'
import type { AlignMethod } from 'app'
import { Disposable } from '@/utils/lifecycle'
import { EventbusService, IEventbusService } from '@/core/eventbus/eventbusService'
import { IUndoRedoService, UndoRedoService } from '@/app/editor/undoRedo/undoRedoService'

export class Layer extends Disposable {
  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService private readonly keybinding: KeybindingService,
    @IEventbusService readonly eventbus: EventbusService,
    @IUndoRedoService private readonly undoRedo: UndoRedoService,
  ) {
    super()
    this.keybinding.bind(['del', 'backspace'], (e) => {
      const objects = canvas.getActiveObjects()
      if (objects.length === 0) return
      e.preventDefault?.()
      this.deleteLayer(objects)
      canvas.discardActiveObject()
      canvas.requestRenderAll()
      this.undoRedo.saveState()
    })

    // 移至底层
    this.keybinding.bind('[', (e) => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      e.preventDefault?.()
      this.objForEach((obj) => {
        const group = obj.getParent()
        group.sendObjectToBack(obj)
      }, true)
      canvas.requestRenderAll()
      this.undoRedo.saveState()
    })

    // 移至顶层
    this.keybinding.bind(']', (e) => {
      const activeObjects = canvas.getActiveObjects()
      if (!activeObjects) return
      e.preventDefault?.()
      this.objForEach((obj) => {
        const group = obj.getParent()
        group.bringObjectToFront(obj)
      })
      canvas.requestRenderAll()
      this.undoRedo.saveState()
    })

    // 向下移动一层
    this.keybinding.bind('mod+[', (e) => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      e.preventDefault?.()
      const isActiveSelection = util.isActiveSelection(activeObject)
      this.objForEach((obj) => {
        const group = obj.getParent()
        // 排除已经在最底层的元素
        if (
          isActiveSelection &&
          group._objects.indexOf(obj) === activeObject._objects.indexOf(obj)
        ) {
          return
        }
        group.sendObjectBackwards(obj)
      })
      canvas.requestRenderAll()
      this.undoRedo.saveState()
    })

    // 向上移动一层
    this.keybinding.bind('mod+]', (e) => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      e.preventDefault?.()
      const isActiveSelection = util.isActiveSelection(activeObject)
      this.objForEach((obj) => {
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
      }, true)
      canvas.requestRenderAll()
      this.undoRedo.saveState()
    })

    // 创建分组
    this.keybinding.bind('mod+g', (e) => {
      const objects = canvas.getActiveObjects()
      if (objects.length === 0) return
      e.preventDefault?.()
      // 获取要插入的分组，在deleteLayer前获取，不然获取不到
      const insertGroup = objects[0].getParent()
      const index = insertGroup._objects.indexOf(objects[0])
      // discardActiveObject 修复选中一个组内元素一个组外元素，打组位置偏移
      canvas.discardActiveObject()
      // 创建组
      const group = new Group(
        this.deleteLayer(
          objects
            .filter((obj, index, array) => {
              // 画板不能进组
              if (obj instanceof Board) {
                return false
              }
              // 如果元素的组也在objects里，则排除该元素
              const parent = obj.getParent(true)
              return !parent || !array.includes(parent)
            })
            .reverse(),
        ),
      )
      insertGroup.insertAt(index, group)
      // 设置激活对象
      canvas.setActiveObject(group)
      this.undoRedo.saveState()
    })

    // 解除分组
    this.keybinding.bind('mod+shift+g', (e) => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject || !util.isCollection(activeObject)) return
      e.preventDefault?.()
      const parentGroup = activeObject.getParent()
      const index = parentGroup._objects.indexOf(activeObject)
      // 移除组
      const objects = activeObject.removeAll() as FabricObject[]
      parentGroup.insertAt(index, ...objects)
      // 设置激活对象
      canvas.setActiveObjects(objects.reverse())
      this.undoRedo.saveState()
    })

    // 选择全部
    this.keybinding.bind('mod+a', (e) => {
      e.preventDefault?.()
      const activeObject = canvas.getActiveObject()
      const parent = activeObject?.getParent() || canvas
      canvas.setActiveObjects(parent.getObjects().reverse())
      canvas.requestRenderAll()
    })

    // 显示/隐藏
    this.keybinding.bind('mod+shift+h', (e) => {
      e.preventDefault?.()
      this.objForEach((obj) => {
        obj.visible = !obj.visible
        obj.getParent(true)?.setDirty()
      })
      canvas.requestRenderAll()
      this.undoRedo.saveState()
    })

    // 锁定/解锁
    this.keybinding.bind('mod+shift+l', (e) => {
      e.preventDefault?.()
      this.objForEach((obj) => {
        obj.evented = !obj.evented
        obj.hasControls = obj.evented
        obj.selectable = obj.evented
      })
      canvas.requestRenderAll()
      this.undoRedo.saveState()
    })

    // 重命名
    this.keybinding.bind('mod+r', (e) => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      e.preventDefault?.()
      eventbus.emit('layerRename', {
        id: activeObject.id,
      })
    })

    // 水平翻转
    this.keybinding.bind('shift+h', (e) => {
      const activeObjects = canvas.getActiveObjects()
      if (activeObjects.length === 0) return
      e.preventDefault?.()
      activeObjects.forEach((obj) => {
        obj.flipX = !obj.flipX
      })
      canvas.requestRenderAll()
      this.undoRedo.saveState()
    })

    // 垂直翻转
    this.keybinding.bind('shift+v', (e) => {
      const activeObjects = canvas.getActiveObjects()
      if (activeObjects.length === 0) return
      e.preventDefault?.()
      activeObjects.forEach((obj) => {
        obj.flipY = !obj.flipY
      })
      canvas.requestRenderAll()
      this.undoRedo.saveState()
    })

    this.bindAlign()
    this.bindArrow()
  }

  private bindArrow() {
    // 上下左右
    const move = (e: KeyboardEvent) => {
      const activeObject = this.canvas.getActiveObject()
      if (!activeObject) return
      e.preventDefault?.()
      const amount = e.shiftKey ? 10 : 1
      const { top, left } = activeObject
      switch (e.key) {
        case 'ArrowUp':
          activeObject.top = top - amount
          break
        case 'ArrowRight':
          activeObject.left = left + amount
          break
        case 'ArrowDown':
          activeObject.top = top + amount
          break
        case 'ArrowLeft':
          activeObject.left = left - amount
          break
      }
      this.canvas.requestRenderAll()
    }
    const resize = (e: KeyboardEvent) => {
      const activeObject = this.canvas.getActiveObject()
      if (!activeObject) return
      e.preventDefault?.()
      const amount = e.shiftKey ? 10 : 1
      switch (e.key) {
        case 'ArrowUp':
          activeObject.setHeight(activeObject.getHeight() - amount)
          break
        case 'ArrowRight':
          activeObject.setWidth(activeObject.getWidth() + amount)
          break
        case 'ArrowDown':
          activeObject.setHeight(activeObject.getHeight() + amount)
          break
        case 'ArrowLeft':
          activeObject.setWidth(activeObject.getWidth() - amount)
          break
      }
      this.canvas.requestRenderAll()
    }
    this.keybinding.bind({
      up: move,
      right: move,
      down: move,
      left: move,
      'shift+up': move,
      'shift+right': move,
      'shift+down': move,
      'shift+left': move,
      'mod+up': resize,
      'mod+right': resize,
      'mod+down': resize,
      'mod+left': resize,
      'shift+mod+up': resize,
      'shift+mod+right': resize,
      'shift+mod+down': resize,
      'shift+mod+left': resize,
    })
  }

  private bindAlign() {
    const align = (e: KeyboardEvent, method: AlignMethod) => {
      const activeObject = this.canvas.getActiveObject()
      if (!activeObject) return
      e.preventDefault?.()
      activeObject[method]()
      this.undoRedo.saveState()
    }
    this.keybinding.bind({
      'alt+a': (e) => align(e, 'alignLeft'),
      'alt+d': (e) => align(e, 'alignRight'),
      'alt+h': (e) => align(e, 'alignCenter'),
      'alt+w': (e) => align(e, 'verticalTop'),
      'alt+s': (e) => align(e, 'verticalBottom'),
      'alt+v': (e) => align(e, 'verticalMiddle'),
    })
  }

  private objForEach(fn: (obj: FabricObject) => void, reverse = false) {
    const objects = this.canvas.getActiveObjects()
    if (reverse) {
      objects.reverse()
    }
    const length = objects.length - 1
    for (let i = length; i >= 0; i--) {
      fn(objects[length - i])
    }
  }

  private deleteLayer(objects: FabricObject[]): FabricObject[] {
    const removed = objects.flatMap((obj) => obj.getParent().remove(obj)) as FabricObject[]
    return removed
  }
}
