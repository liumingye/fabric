import { FabricObject, classRegistry, TPointerEventInfo, TPointerEvent, Board, Rect } from '@fabric'
import type { GroupProps } from 'fabric/src/shapes/Group'
import { CommonGroup } from '@/core/canvas/shapes/commonGroup'
import { clone } from 'lodash'

export class Group extends CommonGroup {
  public subTargetCheck = true

  public interactive = false

  constructor(
    objects?: FabricObject[],
    options?: Partial<GroupProps>,
    objectsRelativeToGroup?: boolean,
  ) {
    super(objects, options, objectsRelativeToGroup)

    this.on('mousedblclick', this.doubleClickHandler.bind(this))
  }

  // 双击后启用interactive，离开组后关闭
  public doubleClickHandler(e: TPointerEventInfo<TPointerEvent>) {
    if (e.subTargets && e.subTargets.length > 0) {
      // 启用
      this.set({
        interactive: true,
        objectCaching: false,
      })

      const addDeselectedEvent = (obj: FabricObject) => {
        obj.once('deselected', () => {
          const activeObject = this.canvas?.getActiveObject()
          if (!activeObject || activeObject.getParent() !== this) {
            // 关闭
            this.set({
              interactive: false,
              objectCaching: true,
            })
          } else {
            // 事件传递
            addDeselectedEvent(activeObject)
          }
        })
      }

      const [subTargets] = e.subTargets
      addDeselectedEvent(subTargets)
      this.canvas?.setActiveObject(subTargets)
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

  override setCoords() {
    if (this.isMoving) {
      FabricObject.prototype.setCoords.call(this)
    } else {
      super.setCoords()
    }
  }

  override render(ctx: CanvasRenderingContext2D) {
    this._transformDone = true
    super.render(ctx)

    if (this.stroke && this.strokeWidth !== 0) {
      ctx.save()
      this.transform(ctx)
      const obj = clone(this)
      obj.fill = ''
      Rect.prototype._render.call(obj, ctx)
      ctx.restore()
    }

    this._transformDone = false
  }
}

classRegistry.setClass(Group)
