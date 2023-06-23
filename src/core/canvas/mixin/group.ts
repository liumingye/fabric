import { Group } from 'fabric'
import { FabricObject } from '@fabric'

const setCoordsOrigin = Group.prototype.setCoords
const _shouldSetNestedCoordsOrigin = Group.prototype._shouldSetNestedCoords

Group.prototype.setCoords = function () {
  if (this.isMoving) {
    FabricObject.prototype.setCoords.call(this)
  } else {
    setCoordsOrigin.call(this)
  }
}

Group.prototype._shouldSetNestedCoords = function () {
  // 开启subTargetCheck性能差，优化
  if (!this.canvas || this.canvas.selection === false || this.canvas.skipTargetFind === true) {
    return false
  }
  return _shouldSetNestedCoordsOrigin.call(this)
}
