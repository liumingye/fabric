import { Group as GroupOrigin } from 'fabric'
import { FabricObject, classRegistry, TPointerEventInfo, TPointerEvent } from '@fabric'
import type { GroupProps } from 'fabric/src/shapes/Group'
import { toRefObject } from '@/core/canvas/toRefObject'
import { createCollectionMixin } from '@/core/canvas/Collection'

export class Group extends createCollectionMixin(GroupOrigin) {
  constructor(
    objects?: FabricObject[],
    options?: Partial<GroupProps>,
    objectsRelativeToGroup?: boolean,
  ) {
    const newObjects = objects?.map((obj) => toRefObject(obj))

    super(newObjects, options, objectsRelativeToGroup)

    this.on('mousedblclick', this.doubleClickHandler.bind(this))
  }

  // 双击后启用interactive，离开组后关闭
  private doubleClickHandler(e: TPointerEventInfo<TPointerEvent>) {
    if (e.subTargets && e.subTargets.length > 0) {
      this.set('interactive', true)
      const addDeselectedEvent = (obj: FabricObject) => {
        obj.once('deselected', () => {
          const activeObject = this.canvas?.getActiveObject()
          if (!activeObject || activeObject.getParent() !== this) {
            // 关闭
            this.set('interactive', false)
          } else {
            // 事件接力
            addDeselectedEvent(activeObject)
          }
        })
      }
      addDeselectedEvent(e.subTargets[0])
      this.canvas?.setActiveObject(e.subTargets[0])
      this.canvas?.requestRenderAll()
    }
  }

  public setDirty() {
    this._set('dirty', true)
  }

  public updateLayout() {
    this._applyLayoutStrategy({ type: 'object_modified' })
    this.setDirty()
  }

  // 空子元素，自动移除组本身
  override _onObjectRemoved(object: FabricObject, removeParentTransform?: boolean): void {
    super._onObjectRemoved(object, removeParentTransform)
    if (this.size() === 0) {
      const parent = this.getParent()
      parent && parent.remove(this)
    }
  }
}

Object.assign(Group.ownDefaults, {
  subTargetCheck: true,
})

classRegistry.setClass(Group)
