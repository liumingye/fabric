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
  TFiller,
  Pattern,
  Gradient,
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
  perPixelTargetFind: true,
} as FabricObject)

const _renderControlsOrigin = FabricObject.prototype._renderControls

const mixin = {
  getWidthHeight(noFixed = false) {
    const objScale = this.getObjectScaling()
    const point = this._getTransformedDimensions({
      scaleX: objScale.x,
      scaleY: objScale.y,
    })
    if (!noFixed) {
      point.setX(toFixed(point.x))
      point.setY(toFixed(point.y))
    }
    return point
  },
  getHeight() {
    return this.getWidthHeight().y
  },
  getWidth() {
    return this.getWidthHeight().x
  },
  setHeight(value: number) {
    value = Math.max(value, this.strokeWidth, 0.5)
    const height = NP.divide(NP.minus(this.getWidthHeight(true).y, this.strokeWidth), this.scaleY)
    const newScale = NP.divide(NP.minus(value, this.strokeWidth), height)
    if (newScale === Infinity || Number.isNaN(newScale)) return
    this.set('scaleY', newScale || 0.00001)
    this.fire('scaling')
  },
  setWidth(value: number) {
    value = Math.max(value, this.strokeWidth, 0.5)
    const width = NP.divide(NP.minus(this.getWidthHeight(true).x, this.strokeWidth), this.scaleX)
    const newScale = NP.divide(NP.minus(value, this.strokeWidth), width)
    if (newScale === Infinity || Number.isNaN(newScale)) return
    this.set('scaleX', newScale || 0.00001)
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
    // todo: 画板内元素原点为画板左上角
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
  _renderControls(ctx: CanvasRenderingContext2D, styleOverride?: ControlRenderingStyleOverride) {
    // 移动时关闭控制渲染
    if (this.isMoving) {
      this.setCoords()
      return
    }
    _renderControlsOrigin.call(this, ctx, styleOverride)
  },
  _applyPatternGradientTransform(ctx: CanvasRenderingContext2D, filler: TFiller) {
    if (!util.isFiller(filler)) {
      return { offsetX: 0, offsetY: 0 }
    }
    const t =
      (filler as Gradient<'linear'>).gradientTransform || (filler as Pattern).patternTransform
    let offsetX = -this.width / 2 + filler.offsetX || 0,
      offsetY = -this.height / 2 + filler.offsetY || 0

    if ((filler as Gradient<'linear'>).gradientUnits === 'percentage') {
      ctx.transform(this.width, 0, 0, this.height, offsetX, offsetY)
    }

    // 填充 | 适应
    else if (
      util.isPattern(filler) &&
      (filler.fit == 'fill' || filler.fit == 'padding') &&
      filler.isImageSource()
    ) {
      // 计算缩放比例和偏移量
      filler.repeat = 'no-repeat'
      const objScale = this.getObjectScaling()
      const { naturalHeight, naturalWidth } = filler.source
      const { x: objWidth, y: objHeight } = this.getWidthHeight()
      const scaleX = objWidth / naturalWidth
      const scaleY = objHeight / naturalHeight
      const scale = Math[filler.fit === 'fill' ? 'max' : 'min'](scaleX, scaleY)
      if (filler.fit === 'fill' ? scaleX > scaleY : scaleX < scaleY) {
        offsetY -= (naturalHeight * scale - objHeight) / objScale.y / 2
      } else {
        offsetX -= (naturalWidth * scale - objWidth) / objScale.x / 2
      }
      filler.patternTransform = [scale / objScale.x, 0, 0, scale / objScale.y, offsetX, offsetY]
      ctx.transform(...filler.patternTransform)
      return { offsetX, offsetY }
    } else {
      ctx.transform(1, 0, 0, 1, offsetX, offsetY)
    }
    if (t) {
      ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5])
    }
    return { offsetX, offsetY }
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

const cancelPerPixel = [Text, IText, Textbox, Group, Board]
cancelPerPixel.forEach((obj) => {
  obj.ownDefaults.perPixelTargetFind = false
})
