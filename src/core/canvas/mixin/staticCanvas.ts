import { StaticCanvas } from 'fabric'
import { Point, FabricObject, util } from '@fabric'
import type { fabric } from '@/dts/fabric'

// 收集box内的元素
const _collectObjects = (
  _objects: FabricObject[] | undefined,
  box: fabric.TBBox,
  opt: { includeIntersecting?: boolean },
) => {
  const { left, top, width, height } = box
  const { includeIntersecting } = opt

  const collected: FabricObject[] = []

  const tl = new Point(left, top)
  const br = tl.add(new Point(width, height))

  _objects?.forEach((object: FabricObject) => {
    if (
      // 包含子元素
      util.isCollection(object) &&
      object.subTargetCheck &&
      object.visible &&
      object._objects &&
      // 与box相交
      (object.intersectsWithRect(tl, br, true) ||
        object.containsPoint(tl, undefined, true) ||
        object.containsPoint(br, undefined, true))
    ) {
      // 递归子元素
      collected.push(..._collectObjects(object._objects, box, opt))
    }

    // box与画板重叠才会被收集
    const isBoard = util.isBoard(object)
    if (
      // 画板或可选择
      (isBoard || object.selectable) &&
      // 可视
      object.visible &&
      // 与box重叠
      (object.isContainedWithinRect(tl, br, true) ||
        (!isBoard &&
          includeIntersecting &&
          (object.intersectsWithRect(tl, br, true) ||
            object.containsPoint(tl, undefined, true) ||
            object.containsPoint(br, undefined, true))))
    ) {
      collected.push(object)
    }
  })

  return collected
}

const mixin = {
  collectObjects(box: fabric.TBBox, opt = {}) {
    return _collectObjects(this._objects, box, opt)
  },
} as Partial<StaticCanvas>

Object.assign(StaticCanvas.prototype, mixin)
