import { StaticCanvas } from 'fabric'
import { Point, FabricObject, util } from '../fabric'
import type { TBBox } from '../types'

type IFabricObject = FabricObject & {
  subTargetCheck?: boolean
  _objects?: IFabricObject[]
}

// 收集box内的元素
const _collectObjects = (
  _objects: FabricObject[] | undefined,
  box: TBBox,
  opt: { includeIntersecting?: boolean },
) => {
  const { left, top, width, height } = box
  const { includeIntersecting } = opt

  const collected: IFabricObject[] = []

  const tl = new Point(left, top)
  const br = tl.add(new Point(width, height))

  _objects?.forEach((object: IFabricObject) => {
    if (
      // 包含子元素
      object.subTargetCheck &&
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

Object.assign<StaticCanvas, Partial<StaticCanvas>>(StaticCanvas.prototype, {
  collectObjects: function (box: TBBox, opt = {}) {
    return _collectObjects(this._objects as FabricObject[] | undefined, box, opt)
  },
})

// StaticCanvas.prototype.collectObjects = function collectObjects(box: TBBox, opt = {}) {
//   return _collectObjects(this._objects, box, opt)
// }
