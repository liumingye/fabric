import { StaticCanvas } from 'fabric'
import { Point, FabricObject, util, Board, TBBox } from '@fabric'

// 收集box内的元素
const _collectObjects = (
  _objects: FabricObject[] | undefined,
  box: TBBox,
  opt: { includeIntersecting?: boolean },
) => {
  const { left, top, width, height } = box
  const { includeIntersecting } = opt

  const collected: FabricObject[] = []

  const tl = new Point(left, top)
  const br = tl.add(new Point(width, height))

  _objects?.forEach((object: FabricObject) => {
    if (
      // 画板
      object instanceof Board &&
      object.evented &&
      // 组内的元素在clipPath外边的部分不会收集
      // todo: intersectsWithRect无效待修复
      (object.intersectsWithRect(tl, br, true) ||
        object.containsPoint(tl, undefined, true) ||
        object.containsPoint(br, undefined, true))
    ) {
      // 递归子元素
      collected.push(..._collectObjects(object._objects, box, opt))
    }

    // 画板内有元素开启includeIntersecting，没有则关闭
    const isBoard = util.isBoard(object)
    const isIncludeIntersecting =
      (!isBoard || object._objects.length === 0) &&
      includeIntersecting &&
      (object.intersectsWithRect(tl, br, true) ||
        object.containsPoint(tl, undefined, true) ||
        object.containsPoint(br, undefined, true))
    if (
      // 可选择
      (object.selectable || (isBoard && object._objects.length !== 0)) &&
      // 可视
      object.visible &&
      object.evented &&
      // 与box重叠
      (object.isContainedWithinRect(tl, br, true) || isIncludeIntersecting)
    ) {
      collected.push(object)
    }
  })

  return collected
}

StaticCanvas.prototype.collectObjects = function (box: TBBox, opt = {}) {
  return _collectObjects(this._objects, box, opt)
}
