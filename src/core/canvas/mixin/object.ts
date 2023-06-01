import {
  Object as FabricObject,
  ActiveSelection,
  Group,
  util,
  Point,
  Textbox,
  Text,
  IText,
  Path,
  Ellipse,
  Board,
  Rect,
  Image,
} from '@fabric'
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
  snapAngle: 1,
  perPixelTargetFind: true,
} as FabricObject)

const mixin = {
  getHeight() {
    let height = this.getScaledHeight()
    if (this.group) {
      height = NP.times(height, this.group.scaleY)
    }
    return toFixed(height)
  },
  getWidth() {
    let width = this.getScaledWidth()
    if (this.group) {
      width = NP.times(width, this.group.scaleX)
    }
    return toFixed(width)
  },
  setHeight(value: number) {
    if (this.group) {
      value = NP.divide(value, this.group.scaleY)
    }
    this.set('scaleY', NP.divide(NP.minus(value, this.strokeWidth), this.height))
    this.fire('scaling')
  },
  setWidth(value: number) {
    if (this.group) {
      value = NP.divide(value, this.group.scaleX)
    }
    this.set('scaleX', NP.divide(NP.minus(value, this.strokeWidth), this.width))
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
FabricObject.prototype._type = 'Object'
Group.prototype._type = 'Group'
ActiveSelection.prototype._type = 'ActiveSelection'

const cancelPerPixel = [Text, IText, Textbox, Group]
cancelPerPixel.forEach((obj) => {
  obj.ownDefaults.perPixelTargetFind = false
})
