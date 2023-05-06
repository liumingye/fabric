import { Canvas as FabricCanvas } from 'fabric'
import type * as editor from 'editor'

export class Canvas extends FabricCanvas {
  public activeObject = ref<editor.fabric.Object>()

  override _setActiveObject(object: editor.fabric.Object, e?: editor.fabric.TPointerEvent) {
    return super._setActiveObject(object, e), (this.activeObject.value = this._activeObject)
  }

  override _discardActiveObject(e?: editor.fabric.TPointerEvent, object?: editor.fabric.Object) {
    return super._discardActiveObject(e, object), (this.activeObject.value = this._activeObject)
  }
}
