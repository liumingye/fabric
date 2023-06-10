import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IKeybindingService, KeybindingService } from '@/core/keybinding/keybindingService'
import { Board, FabricObject, Group, util } from '@fabric'
import type { AlignMethod } from 'app'
import { Disposable } from '@/utils/lifecycle'
import { EventbusService, IEventbusService } from '@/core/eventbus/eventbusService'
import { IUndoRedoService, UndoRedoService } from '@/app/editor/undoRedo/undoRedoService'
import { keybindMap } from '@/utils/constants'

export class Layer extends Disposable {
  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService private readonly keybinding: KeybindingService,
    @IEventbusService readonly eventbus: EventbusService,
    @IUndoRedoService private readonly undoRedo: UndoRedoService,
  ) {
    super()
    this.keybinding.bind(['del', 'backspace'], () => {
      const objects = canvas.getActiveObjects()
      if (objects.length === 0) return
      this.deleteLayer(objects)
      canvas.discardActiveObject()
      canvas.requestRenderAll()
      this.undoRedo.saveState()
      return false
    })

    // 移至底层
    this.keybinding.bind('[', () => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      this.objForEach((obj) => {
        const group = obj.getParent()
        group.sendObjectToBack(obj)
      }, true)
      canvas.requestRenderAll()
      this.undoRedo.saveState()
      return false
    })

    // 移至顶层
    this.keybinding.bind(']', () => {
      const activeObjects = canvas.getActiveObjects()
      if (!activeObjects) return
      this.objForEach((obj) => {
        const group = obj.getParent()
        group.bringObjectToFront(obj)
      })
      canvas.requestRenderAll()
      this.undoRedo.saveState()
      return false
    })

    // 向下移动一层
    this.keybinding.bind('mod+[', () => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
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
      return false
    })

    // 向上移动一层
    this.keybinding.bind('mod+]', () => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
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
      return false
    })

    // 创建分组
    this.keybinding.bind(keybindMap.group, () => {
      const objects = canvas.getActiveObjects()
      if (objects.length === 0) return
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
      return false
    })

    // 解除分组
    this.keybinding.bind(keybindMap.ungroup, () => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject || !util.isCollection(activeObject)) return
      const parentGroup = activeObject.getParent()
      const index = parentGroup._objects.indexOf(activeObject)
      // 移除组
      const objects = activeObject.removeAll() as FabricObject[]
      parentGroup.insertAt(index, ...objects)
      // 设置激活对象
      canvas.setActiveObjects(objects.reverse())
      this.undoRedo.saveState()
      return false
    })

    // 选择全部
    this.keybinding.bind('mod+a', () => {
      const activeObject = canvas.getActiveObject()
      const parent = activeObject?.getParent() || canvas
      canvas.setActiveObjects(parent.getObjects().reverse())
      canvas.requestRenderAll()
      return false
    })

    // 显示/隐藏
    this.keybinding.bind('mod+shift+h', () => {
      this.objForEach((obj) => {
        obj.visible = !obj.visible
        obj.getParent(true)?.setDirty()
      })
      canvas.requestRenderAll()
      this.undoRedo.saveState()
      return false
    })

    // 锁定/解锁
    this.keybinding.bind('mod+shift+l', () => {
      this.objForEach((obj) => {
        obj.evented = !obj.evented
        obj.hasControls = obj.evented
        obj.selectable = obj.evented
      })
      canvas.requestRenderAll()
      this.undoRedo.saveState()
      return false
    })

    // 透明度
    const setOpacity = (opacity: number) => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      activeObject.set('opacity', opacity)
      canvas.requestRenderAll()
      this.undoRedo.saveState()
      return false
    }
    this.keybinding.bind({
      0: setOpacity.bind(this, 1),
      1: setOpacity.bind(this, 0.1),
      2: setOpacity.bind(this, 0.2),
      3: setOpacity.bind(this, 0.3),
      4: setOpacity.bind(this, 0.4),
      5: setOpacity.bind(this, 0.5),
      6: setOpacity.bind(this, 0.6),
      7: setOpacity.bind(this, 0.7),
      8: setOpacity.bind(this, 0.8),
      9: setOpacity.bind(this, 0.9),
    })

    // 重命名
    this.keybinding.bind('mod+r', () => {
      const activeObject = canvas.getActiveObject()
      if (!activeObject) return
      eventbus.emit('layerRename', {
        id: activeObject.id,
      })
      return false
    })

    // 水平翻转
    this.keybinding.bind('shift+h', () => {
      const activeObjects = canvas.getActiveObjects()
      if (activeObjects.length === 0) return
      activeObjects.forEach((obj) => {
        obj.flipX = !obj.flipX
      })
      canvas.requestRenderAll()
      this.undoRedo.saveState()
      return false
    })

    // 垂直翻转
    this.keybinding.bind('shift+v', () => {
      const activeObjects = canvas.getActiveObjects()
      if (activeObjects.length === 0) return
      activeObjects.forEach((obj) => {
        obj.flipY = !obj.flipY
      })
      canvas.requestRenderAll()
      this.undoRedo.saveState()
      return false
    })

    this.bindAlign()
    this.bindArrow()
  }

  private bindArrow() {
    // 上下左右
    const move = (e: KeyboardEvent) => {
      const activeObject = this.canvas.getActiveObject()
      if (!activeObject) return
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
      return false
    }
    const resize = (e: KeyboardEvent) => {
      const activeObject = this.canvas.getActiveObject()
      if (!activeObject) return
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
      return false
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
    const align = (method: AlignMethod) => {
      const activeObject = this.canvas.getActiveObject()
      if (!activeObject) return
      activeObject[method]()
      this.undoRedo.saveState()
      return false
    }
    this.keybinding.bind({
      'alt+a': align.bind(this, 'alignLeft'),
      'alt+d': align.bind(this, 'alignRight'),
      'alt+h': align.bind(this, 'alignCenter'),
      'alt+w': align.bind(this, 'verticalTop'),
      'alt+s': align.bind(this, 'verticalBottom'),
      'alt+v': align.bind(this, 'verticalMiddle'),
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
