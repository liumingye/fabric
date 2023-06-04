import { createCollectionMixin } from '@/core/canvas/Collection'
import { Group as GroupOrigin } from 'fabric'
import { toRefObject } from '@/core/canvas/toRefObject'
import { FabricObject } from '@fabric'
import type { GroupProps } from 'fabric/src/shapes/Group'

export class CommonGroup extends createCollectionMixin(GroupOrigin) {
  constructor(
    objects?: FabricObject[],
    options?: Partial<GroupProps>,
    objectsRelativeToGroup?: boolean,
  ) {
    super(
      objects?.map((obj) => toRefObject(obj)),
      options,
      objectsRelativeToGroup,
    )
  }

  override _shouldSetNestedCoords() {
    // 开启subTargetCheck性能差，优化
    if (!this.canvas || this.canvas.selection === false || this.canvas.skipTargetFind === true) {
      return false
    }
    return super._shouldSetNestedCoords()
  }

  public setDirty() {
    this._set('dirty', true)
  }

  public updateLayout() {
    this._applyLayoutStrategy({ type: 'object_modified' })
    this.setDirty()
  }
}
