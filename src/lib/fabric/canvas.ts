import { Canvas as FabricCanvas } from 'fabric'
import type { FabricObject, Point } from './fabric'
import type { TPointerEvent, Transform } from './types'

export class Canvas extends FabricCanvas {
  public activeObject = ref<FabricObject>()

  // constructor(el: string | HTMLCanvasElement, options = {}) {
  //   super(el, options)
  // }

  override _setActiveObject(object: FabricObject, e?: TPointerEvent) {
    return super._setActiveObject(object, e), (this.activeObject.value = this._activeObject)
  }

  override _discardActiveObject(e?: TPointerEvent, object?: FabricObject) {
    return super._discardActiveObject(e, object), (this.activeObject.value = this._activeObject)
  }

  // _transformObject(e) {
  //   super._transformObject(e)
  //   console.log('_transformObject')
  //   nextTick(() => {
  //     this.setViewportTransform(this.viewportTransform)
  //   })
  // }
}
