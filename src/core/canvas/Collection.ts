import type { FabricObject } from '@fabric'
import type { Group, Canvas } from 'fabric'
import { toRefObject } from '@/core/canvas/toRefObject'

export type Constructor<T = any> = new (...args: any[]) => T

export function createCollectionMixin<TBase extends Constructor>(Base: TBase): TBase {
  class Collection extends (Base as Constructor<Group & Canvas>) {
    add(...objects: FabricObject[]): number {
      return super.add(...objects.map((obj) => toRefObject(obj)))
    }

    insertAt(index: number, ...objects: FabricObject[]): number {
      return super.insertAt(index, ...objects.map((obj) => toRefObject(obj)))
    }

    _onObjectAdded(obj: FabricObject) {
      if (obj.get('noEventObjectAdded')) {
        obj._set('canvas', this)
      } else {
        super._onObjectAdded(obj)
      }
    }

    /**
     * 图层位置改变
     */
    override _onStackOrderChanged() {
      super._onStackOrderChanged()
      // 通知canvas的objects更新，用于更新layerCatalogue组件的tree
      if (this.canvas) {
        triggerRef(this.canvas.computed.objects)
      } else {
        triggerRef(this.computed.objects)
      }
      // 更新objects
      // triggerRef(this.computed.objects)
      // this.canvas && triggerRef(this.canvas.computed.objects)
    }
  }
  return Collection as TBase
}
