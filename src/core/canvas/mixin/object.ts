import {
  Object as FabricObject,
  ActiveSelection,
  Group,
  util,
  Point,
  Textbox,
  Text,
  IText,
  Triangle,
  Path,
  Ellipse,
  Board,
  Rect,
  Image,
} from '@fabric'
import type { ControlRenderingStyleOverride } from 'fabric/src/controls/controlRendering'
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
  // borderOpacityWhenMoving: 0,
  controls: createObjectDefaultControls(),
  includeDefaultValues: false,
  snapAngle: 1,
  paintFirst: 'stroke',
  // 等待bug修复后开启
  // perPixelTargetFind: true,
} as FabricObject)

const mixin = {
  getWidthHeight() {
    const point = this._getTransformedDimensions()
    if (this.group) {
      point.setX(NP.times(point.x, this.group.scaleX))
      point.setY(NP.times(point.y, this.group.scaleY))
    }
    point.setX(toFixed(point.x))
    point.setY(toFixed(point.y))
    return point
  },
  getHeight() {
    return this.getWidthHeight().y
  },
  getWidth() {
    return this.getWidthHeight().x
  },
  setHeight(value: number) {
    if (this.group) {
      value = NP.divide(value, this.group.scaleY)
    }
    const height = this._getTransformedDimensions({
      scaleX: 1,
      scaleY: 1,
      strokeWidth: 0,
    }).y
    this.set('scaleY', NP.divide(NP.minus(value, this.strokeWidth), height))
    this.fire('scaling')
  },
  setWidth(value: number) {
    if (this.group) {
      value = NP.divide(value, this.group.scaleX)
    }
    const width = this._getTransformedDimensions({
      scaleX: 1,
      scaleY: 1,
      strokeWidth: 0,
    }).x
    this.set('scaleX', NP.divide(NP.minus(value, this.strokeWidth), width))
    this.fire('scaling')
  },
  setAngle(value: number) {
    this.rotate(toFixed(clampAngle(value)))
  },
  getLeftTop() {
    const relativePosition = this.getRelativeXY()
    if (!this.group) {
      return relativePosition
    }
    const transformMatrix = this.group.calcTransformMatrix()
    const point = relativePosition.transform(transformMatrix)
    // if (this.group instanceof Board) {
    //   return point.subtract(this.group.getRelativeXY())
    // }
    return point
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

      // if (this.group instanceof Board) {
      //   point = point.add(this.group.getRelativeXY())
      // }
    }
    this.setRelativeXY(point)
  },
  setLeft(value: number) {
    this.setLeftTop(this.getLeftTop().setX(value))
  },
  setTop(value: number) {
    this.setLeftTop(this.getLeftTop().setY(value))
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
  isType(...types: string[]) {
    return types.includes(this._type) || types.includes(this.constructor.name)
  },
  _renderControls(
    ctx: CanvasRenderingContext2D,
    styleOverride?: ControlRenderingStyleOverride,
    childrenOverride?: ControlRenderingStyleOverride,
  ) {
    // 移动时关闭控制渲染
    if (this.isMoving) {
      this.setCoords()
      return
    }
    Object.getPrototypeOf(FabricObject.prototype)._renderControls.call(
      this,
      ctx,
      styleOverride,
      childrenOverride,
    )
  },
} as FabricObject

Object.assign(FabricObject.prototype, mixin)

// @ts-ignore
delete IText.prototype.type
Object.defineProperties(FabricObject.prototype, {
  type: {
    get() {
      const name = this._type || this.constructor.name
      if (name === 'FabricObject') {
        return 'object'
      }
      return name.toLowerCase()
    },
    set(_value) {},
  },
})

Rect.prototype._type = 'Rect'
Ellipse.prototype._type = 'Ellipse'
Text.prototype._type = 'Text'
IText.prototype._type = 'IText'
Textbox.prototype._type = 'Textbox'
Path.prototype._type = 'Path'
Board.prototype._type = 'Board'
Image.prototype._type = 'Image'
Triangle.prototype._type = 'Triangle'
FabricObject.prototype._type = 'Object'
Group.prototype._type = 'Group'
ActiveSelection.prototype._type = 'ActiveSelection'

// const cancelPerPixel = [Text, IText, Textbox, Group]
// cancelPerPixel.forEach((obj) => {
//   obj.ownDefaults.perPixelTargetFind = false
// })
