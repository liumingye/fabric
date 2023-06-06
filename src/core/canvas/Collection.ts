import { FabricObject, util } from '@fabric'
import type { Group, Canvas } from '@fabric'
import { toRefObject } from '@/core/canvas/toRefObject'
import { randomText } from '@/utils/strings'

export type Constructor<T = any> = new (...args: any[]) => T

export function createCollectionMixin<TBase extends Constructor>(Base: TBase): TBase {
  class Collection extends (Base as Constructor<Group & Canvas>) {
    override add(...objects: FabricObject[]): number {
      return super.add(
        ...objects.map((obj) => {
          this.setDefaultAttr(obj)
          return toRefObject(obj)
        }),
      )
    }

    override insertAt(index: number, ...objects: FabricObject[]): number {
      return super.insertAt(
        index,
        ...objects.map((obj) => {
          this.setDefaultAttr(obj)
          return toRefObject(obj)
        }),
      )
    }

    override _onObjectAdded(obj: FabricObject) {
      if (obj.noEventObjectAdded) {
        obj._set('canvas', this)
      } else {
        super._onObjectAdded(obj)
      }
    }

    private uniqueIds = new Map<string, number>()

    private setDefaultAttr(target: FabricObject) {
      // 添加名称
      // todo 临时方法 findFirstMissingPositive
      if (!target.name) {
        const className = target.type
        const id = this.uniqueIds.get(className) || 1
        target.set({
          name: `${className} ${id}`,
        })
        this.uniqueIds.set(className, id + 1)
      }
      // 添加id
      if (!target.id) {
        target.set({
          id: randomText(),
        })
      }
      if (util.isCollection(target)) {
        target._objects.forEach((obj) => {
          this.setDefaultAttr(obj)
        })
      }
    }
  }
  return Collection as typeof Collection & TBase
}
