import { Object as FabricObject, ActiveSelection, Group, util, Point } from '@fabric'
import { AlignMethod } from 'app'
import { createObjectDefaultControls } from '@/core/canvas/controls/commonControls'
import { clampAngle, toFixed } from '@/utils/math'
import NP from 'number-precision'

Object.assign(FabricObject.ownDefaults, {
  strokeUniform: true,
  strokeWidth: 0,
  fill: '#CCCCCC',
  cornerSize: 8,
  transparentCorners: false,
  cornerColor: '#FFF',
  borderColor: '#2A82E4',
  cornerStrokeColor: '#2A82E4',
  borderOpacityWhenMoving: 0,
  controls: createObjectDefaultControls(),
  includeDefaultValues: false,
} as FabricObject)

const mixin = {
  getHeight() {
    return toFixed(this.getBoundingRect(true, true).height)
  },
  getWidth() {
    return toFixed(this.getBoundingRect(true, true).width)
  },
  setHeight(value: number) {
    const boundingRectFactor = NP.divide(
      this.getBoundingRect(true, true).height,
      this.getScaledHeight(),
    )
    this.set(
      'scaleY',
      NP.divide(NP.divide(NP.minus(value, this.strokeWidth), this.height), boundingRectFactor),
    )
    this.fire('scaling')
  },
  setWidth(value: number) {
    const boundingRectFactor = NP.divide(
      this.getBoundingRect(true, true).width,
      this.getScaledWidth(),
    )
    this.set(
      'scaleX',
      NP.divide(NP.divide(NP.minus(value, this.strokeWidth), this.width), boundingRectFactor),
    )
    this.fire('scaling')
  },
  setAngle(value: number) {
    this.rotate(toFixed(clampAngle(value)))
  },
  getLeftTop() {
    const relativePosition = this.getRelativeXY()
    if (this.group) {
      return relativePosition.transform(this.group.calcTransformMatrix())
    }
    return relativePosition
  },
  getLeft() {
    return this.getLeftTop().x
  },
  getTop() {
    return this.getLeftTop().y
  },
  setLeftTop(point: Point) {
    if (this.group) {
      point = point.transform(util.invertTransform(this.group.calcTransformMatrix()))
    }
    this.setRelativeXY(point)
  },
  setLeft(value: number) {
    const point = this.getLeftTop().setX(value)
    this.setLeftTop(point)
  },
  setTop(value: number) {
    const point = this.getLeftTop().setY(value)
    this.setLeftTop(point)
  },
  align(method: AlignMethod) {
    if (!(this instanceof ActiveSelection)) return
    const { left, top, width, height } = this
    const needUpdateGroup = new Set<Group>()
    this._objects.forEach((obj) => {
      switch (method) {
        case 'alignLeft':
          obj.setX(left)
          break
        case 'alignRight':
          obj.setX(left + width - obj.getScaledWidth())
          break
        case 'alignCenter':
          obj.setX(left + (width - obj.getScaledWidth()) / 2)
          break
        case 'verticalTop':
          obj.setY(top)
          break
        case 'verticalBottom':
          obj.setY(top + height - obj.getScaledHeight())
          break
        case 'verticalMiddle':
          obj.setY(top + (height - obj.getScaledHeight()) / 2)
          break
      }
      const group = obj.getParent(true)
      group && needUpdateGroup.add(group)
    })
    needUpdateGroup.forEach((group) => {
      group.setDirty()
    })
    this.canvas?.requestRenderAll()
  },
  alignLeft() {
    this.align('alignLeft')
  },
  alignRight() {
    this.align('alignRight')
  },
  alignCenter() {
    this.align('alignCenter')
  },
  verticalTop() {
    this.align('verticalTop')
  },
  verticalMiddle() {
    this.align('verticalMiddle')
  },
  verticalBottom() {
    this.align('verticalBottom')
  },
  toObject(propertiesToInclude = []) {
    propertiesToInclude.push('id', 'name')
    return Object.getPrototypeOf(FabricObject.prototype).toObject.call(this, propertiesToInclude)
  },
} as FabricObject

Object.assign(FabricObject.prototype, mixin)
