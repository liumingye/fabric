import { Object as FabricObject, ActiveSelection } from 'fabric'
import type { Control } from './fabric'
import { createObjectDefaultControls } from './controls/commonControls'

type TControlSet = Record<string, Control>

Object.assign(FabricObject.ownDefaults, {
  strokeUniform: true,
  strokeWidth: 0,
  fill: '#CCC',
  cornerSize: 8,
  transparentCorners: false,
  cornerColor: '#FFF',
  borderColor: '#2A82E4',
  cornerStrokeColor: '#2A82E4',
  borderOpacityWhenMoving: 0,
  controls: createObjectDefaultControls() as TControlSet,
} as FabricObject)

const exitGroupOrgin = ActiveSelection.prototype.exitGroup
ActiveSelection.prototype.exitGroup = function (
  object: FabricObject,
  removeParentTransform?: boolean,
) {
  exitGroupOrgin.call(this, object, removeParentTransform)
  // 修复移动视窗后选中对象后无法点击对象的问题
  object.setCoords()
}
