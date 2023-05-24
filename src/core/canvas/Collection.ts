import type { FabricObject } from '@fabric'
import type { Group, Canvas } from 'fabric'
import { toRefObject } from '@/core/canvas/toRefObject'

export type Constructor<T = any> = new (...args: any[]) => T

export function createCollectionMixin<TBase extends Constructor>(Base: TBase): TBase {
  class Collection extends (Base as Constructor<Group & Canvas>) {
    override add(...objects: FabricObject[]): number {
      return super.add(...objects.map((obj) => toRefObject(obj)))
    }

    override insertAt(index: number, ...objects: FabricObject[]): number {
      return super.insertAt(index, ...objects.map((obj) => toRefObject(obj)))
    }

    override _onObjectAdded(obj: FabricObject) {
      if (obj.get('noEventObjectAdded')) {
        obj._set('canvas', this)
      } else {
        super._onObjectAdded(obj)
      }
    }
  }
  return Collection as TBase
}
