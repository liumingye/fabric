import { Group as GroupOrigin } from 'fabric'
import { FabricObject, classRegistry } from '@fabric'
import type { GroupProps } from 'fabric/src/shapes/Group'
import { toRefObject } from '@/core/canvas/toRefObject'
import { createCollectionMixin } from '@/core/canvas/Collection'

export class Group extends createCollectionMixin(GroupOrigin) {
  public subTargetCheck = true
  public interactive = true

  constructor(
    objects?: FabricObject[],
    options?: Partial<GroupProps>,
    objectsRelativeToGroup?: boolean,
  ) {
    const newObjects = objects?.map((obj) => toRefObject(obj))

    super(newObjects, options, objectsRelativeToGroup)
  }

  public setDirty() {
    this._set('dirty', true)
  }

  public updateLayout() {
    this._applyLayoutStrategy({ type: 'object_modified' })
    this.setDirty()
  }
}

classRegistry.setClass(Group)
