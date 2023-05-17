import { Object as FabricObject, ActiveSelection } from '@fabric'

const exitGroupOrgin = ActiveSelection.prototype.exitGroup
ActiveSelection.prototype.exitGroup = function (
  object: FabricObject,
  removeParentTransform?: boolean,
) {
  exitGroupOrgin.call(this, object, removeParentTransform)
  // 修复移动视窗后选中对象后无法点击对象的问题
  object.setCoords()
}
