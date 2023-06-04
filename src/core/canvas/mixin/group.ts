import { Group } from 'fabric'
import { FabricObject } from '@fabric'

const setCoordsOrigin = Group.prototype.setCoords

const mixin = {
  setCoords() {
    if (this.isMoving) {
      FabricObject.prototype.setCoords.call(this)
    } else {
      setCoordsOrigin.call(this)
    }
  },
} as Group

Object.assign(Group.prototype, mixin)
