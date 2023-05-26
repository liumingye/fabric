import { createCollectionMixin } from '@/core/canvas/Collection'
import { Group as GroupOrigin } from 'fabric'
import { toRefObject } from '@/core/canvas/toRefObject'
import { FabricObject } from '@fabric'
import type { GroupProps } from 'fabric/src/shapes/Group'

Object.assign(GroupOrigin.ownDefaults, {
  subTargetCheck: true,
})

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
    if (!this.canvas || this.canvas.selection === true || this.canvas.skipTargetFind === false) {
      return super._shouldSetNestedCoords()
    }
    return false
  }
}
