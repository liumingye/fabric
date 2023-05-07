import { StaticCanvas } from 'fabric'
import { Point, FabricObject, util } from './fabric'
import type { TBBox } from './types'

type IFabricObject = FabricObject & { _objects?: FabricObject[] }

// 收集box内的元素
const _collectObjects = (_objects: any[], box: TBBox, opt: { includeIntersecting?: boolean }) => {
  const { left, top, width, height } = box
  let { includeIntersecting } = opt
  const collected: FabricObject[] = []
  const tl = new Point(left, top)
  const br = tl.add(new Point(width, height))
  _objects.forEach((object: IFabricObject) => {
    const isBoard = util.isBoard(object)
    const isIncludeIntersecting = (obj: FabricObject) => {
      return (
        obj.intersectsWithRect(tl, br, true) ||
        obj.containsPoint(tl, undefined, true) ||
        obj.containsPoint(br, undefined, true)
      )
    }
    if (
      // 元素为画板
      isBoard &&
      // 画板包含子元素
      object._objects &&
      // box和画板相交
      isIncludeIntersecting(object)
    ) {
      // 递归子元素
      collected.push(..._collectObjects(object._objects, box, opt))
    }

    // box与画板重叠才会被收集
    if (isBoard) {
      includeIntersecting = false
    }

    if (
      // 画板或可选择
      (isBoard || object.selectable) &&
      // 可视
      object.visible &&
      // 与box重叠
      (object.isContainedWithinRect(tl, br, true) ||
        (includeIntersecting && isIncludeIntersecting(object)))
    ) {
      collected.push(object)
    }
  })
  return collected
}

StaticCanvas.prototype.collectObjects = function collectObjects(box: TBBox, opt = {}) {
  return _collectObjects(this._objects, box, opt)
}

export { StaticCanvas }
