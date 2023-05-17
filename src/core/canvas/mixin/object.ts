import { Object as FabricObject, ActiveSelection, Group, Control } from '@fabric'
import { AlignMethod } from 'app'
import { createObjectDefaultControls } from '@/core/canvas/controls/commonControls'
import { clampAngle, toFixed } from '@/utils/math'

type TControlSet = Record<string, Control>

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
  controls: createObjectDefaultControls() as TControlSet,
} as FabricObject)

const mixin = {
  getHeight() {
    return toFixed(this.getScaledHeight())
  },
  getWidth() {
    return toFixed(this.getScaledWidth())
  },
  setHeight(value: number) {
    this.set('scaleY', (value - this.strokeWidth) / this.height)
  },
  setWidth(value: number) {
    this.set('scaleX', (value - this.strokeWidth) / this.width)
  },
  setAngle(value: number) {
    this.rotate(toFixed(clampAngle(value)))
  },
  setLeft(value: number) {
    this.setX(toFixed(value))
    this.getParent(true)?.setDirty()
  },
  setTop(value: number) {
    this.setY(toFixed(value))
    this.getParent(true)?.setDirty()
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
} as FabricObject

Object.assign(FabricObject.prototype, mixin)