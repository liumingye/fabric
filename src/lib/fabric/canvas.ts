import { Canvas as FabricCanvas } from 'fabric'
import type { fabric } from '@/types'

export class Canvas extends FabricCanvas {
  public activeObject = ref<fabric.Object>()

  override _setActiveObject(object: fabric.Object, e?: fabric.TPointerEvent) {
    return super._setActiveObject(object, e), (this.activeObject.value = this._activeObject)
  }

  override _discardActiveObject(e?: fabric.TPointerEvent, object?: fabric.Object) {
    return super._discardActiveObject(e, object), (this.activeObject.value = this._activeObject)
  }
}
