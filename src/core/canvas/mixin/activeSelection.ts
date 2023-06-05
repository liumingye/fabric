import { Object as FabricObject, ActiveSelection } from '@fabric'

const exitGroupOrigin = ActiveSelection.prototype.exitGroup

ActiveSelection.prototype.exitGroup = function (
  object: FabricObject,
  removeParentTransform?: boolean,
) {
  exitGroupOrigin.call(this, object, removeParentTransform)
  // 修复移动视窗后框选组内对象后无法点击对象的问题
  object.setCoords()
}
