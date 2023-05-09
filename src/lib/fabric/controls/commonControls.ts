import { noop } from '@vueuse/core'
import { Control, FabricObject, controlsUtils, Point } from '../fabric'
import { toFixed } from '@/utils/math'

const positionHandler: Control['positionHandler'] = (
  dim,
  finalMatrix,
  fabricObject,
  currentControl,
) => {
  return new Point(
    currentControl.x * dim.x + currentControl.offsetX,
    currentControl.y * dim.y + currentControl.offsetY,
  ).transform(finalMatrix)
}

const positionHandlerH: Control['positionHandler'] = (
  dim,
  finalMatrix,
  fabricObject,
  currentControl,
) => {
  const size = fabricObject.getScaledHeight()
  currentControl.sizeX = fabricObject.cornerSize
  currentControl.sizeY = size
  currentControl.touchSizeX = fabricObject.touchCornerSize
  currentControl.touchSizeY = size + 8
  return positionHandler(dim, finalMatrix, fabricObject as FabricObject, currentControl)
}

const positionHandlerV: Control['positionHandler'] = (
  dim,
  finalMatrix,
  fabricObject,
  currentControl,
) => {
  const size = fabricObject.getScaledWidth()
  currentControl.sizeX = size
  currentControl.sizeY = fabricObject.cornerSize
  currentControl.touchSizeX = size + 8
  currentControl.touchSizeY = fabricObject.touchCornerSize
  return positionHandler(dim, finalMatrix, fabricObject as FabricObject, currentControl)
}

const rotateIcon = (angle: number) => {
  return `url("data:image/svg+xml,<svg height='18' width='18' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'><g fill='none' transform='rotate(${angle} 16 16)'><path d='M22.4484 0L32 9.57891L22.4484 19.1478V13.1032C17.6121 13.8563 13.7935 17.6618 13.0479 22.4914H19.2141L9.60201 32.01L0 22.4813H6.54912C7.36524 14.1073 14.0453 7.44023 22.4484 6.61688V0Z' fill='white'/><path d='M24.0605 3.89587L29.7229 9.57896L24.0605 15.252V11.3562C17.0479 11.4365 11.3753 17.0895 11.3048 24.0879H15.3048L9.60201 29.7308L3.90932 24.0879H8.0806C8.14106 15.3223 15.2645 8.22345 24.0605 8.14313V3.89587Z' fill='black'/></g></svg>") 12 12,auto`
}

const getRotateControl = (angle: number): Partial<Control> => ({
  sizeX: 16,
  sizeY: 16,
  actionHandler: (eventData, transformData, x, y) => {
    transformData.target.canvas?.setCursor(rotateIcon(transformData.target.angle + angle))
    return controlsUtils.rotationWithSnapping(eventData, transformData, x, y)
  },
  cursorStyleHandler: (eventData, control, fabricObject) => {
    return rotateIcon(fabricObject.angle + angle)
  },
  render: noop,
  actionName: 'rotate',
})

export const createObjectDefaultControls = () => ({
  size: new Control({
    x: 0,
    y: 0.5,
    cursorStyleHandler: () => '',
    offsetY: 20,
    sizeX: 0,
    sizeY: 0,
    touchSizeX: 0,
    touchSizeY: 0,
    render: (ctx, left, top, styleOverride, fabricObject) => {
      // todo: 支持反转的对象
      ctx.save()
      ctx.translate(left, top)
      const angle = fabricObject.getTotalAngle()
      ctx.rotate((angle * Math.PI) / 180)
      const fontSize = 12
      ctx.font = `${fontSize}px Tahoma`
      const { x, y } = fabricObject._getTransformedDimensions()
      const text = `${toFixed(x)} × ${toFixed(y)}`
      const width = ctx.measureText(text).width + 8
      const height = fontSize + 6
      // 背景
      ctx.roundRect(-width / 2, -height / 2, width, height, 4)
      ctx.fillStyle = '#0066ff'
      ctx.fill()
      // 文字
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 0, 1)
      ctx.restore()
    },
  }),

  tlr: new Control({
    x: -0.5,
    y: -0.5,
    offsetX: -4,
    offsetY: -4,
    ...getRotateControl(0),
  }),

  trr: new Control({
    x: 0.5,
    y: -0.5,
    offsetX: 4,
    offsetY: -4,
    ...getRotateControl(90),
  }),

  brr: new Control({
    x: 0.5,
    y: 0.5,
    offsetX: 4,
    offsetY: 4,
    ...getRotateControl(180),
  }),

  blr: new Control({
    x: -0.5,
    y: 0.5,
    offsetX: -4,
    offsetY: 4,
    ...getRotateControl(270),
  }),

  ml: new Control({
    x: -0.5,
    y: 0,
    actionHandler: controlsUtils.scalingXOrSkewingY,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: 'resizing',
    render: noop,
    positionHandler: positionHandlerH,
  }),

  mr: new Control({
    x: 0.5,
    y: 0,
    actionHandler: controlsUtils.scalingXOrSkewingY,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: 'resizing',
    render: noop,
    positionHandler: positionHandlerH,
  }),

  mb: new Control({
    x: 0,
    y: 0.5,
    actionHandler: controlsUtils.scalingYOrSkewingX,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: 'resizing',
    render: noop,
    positionHandler: positionHandlerV,
  }),

  mt: new Control({
    x: 0,
    y: -0.5,
    actionHandler: controlsUtils.scalingYOrSkewingX,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: 'resizing',
    render: noop,
    positionHandler: positionHandlerV,
  }),

  tl: new Control({
    x: -0.5,
    y: -0.5,
    cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
    actionHandler: controlsUtils.scalingEqually,
  }),

  tr: new Control({
    x: 0.5,
    y: -0.5,
    cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
    actionHandler: controlsUtils.scalingEqually,
  }),

  bl: new Control({
    x: -0.5,
    y: 0.5,
    cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
    actionHandler: controlsUtils.scalingEqually,
  }),

  br: new Control({
    x: 0.5,
    y: 0.5,
    cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
    actionHandler: controlsUtils.scalingEqually,
  }),
})
