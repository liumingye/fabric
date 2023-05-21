import { Object as FabricObject, ActiveSelection } from '@fabric'

Object.defineProperties(ActiveSelection.prototype, {
  exitGroup: {
    value: function (object: FabricObject, removeParentTransform?: boolean) {
      this.prototype.exitGroup.call(this, object, removeParentTransform)
      // 修复移动视窗后框选组内对象后无法点击对象的问题
      object.setCoords()
    },
  },
})
