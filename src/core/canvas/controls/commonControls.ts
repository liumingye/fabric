import { noop } from '@vueuse/core'
import { Control, FabricObject, controlsUtils, Point, TControlSet } from '@fabric'
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
  const size = fabricObject.getBoundingRect().height
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
  const size = fabricObject.getBoundingRect().width
  currentControl.sizeX = size
  currentControl.sizeY = fabricObject.cornerSize
  currentControl.touchSizeX = size + 8
  currentControl.touchSizeY = fabricObject.touchCornerSize
  return positionHandler(dim, finalMatrix, fabricObject as FabricObject, currentControl)
}

const rotateIcon = (angle: number) => {
  return `url("data:image/svg+xml,<svg height='20' width='20' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'><g fill='none' transform='rotate(${angle} 16 16)'><path fill='white' d='M18.24 5.37C11.41 6.04 5.98 11.46 5.32 18.26L0 18.26L7.8 26L15.61 18.27L10.6 18.27C11.21 14.35 14.31 11.25 18.24 10.64L18.24 15.55L26 7.78L18.24 0L18.24 5.37Z'></path><path fill='black' d='M19.5463 6.61441C12.4063 6.68441 6.61632 12.4444 6.56632 19.5644L3.17632 19.5644L7.80632 24.1444L12.4363 19.5644L9.18632 19.5644C9.24632 13.8844 13.8563 9.28441 19.5463 9.22441L19.5463 12.3844L24.1463 7.78441L19.5463 3.16441L19.5463 6.61441Z'></path></g></svg>") 12 12,auto`
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

const getHornControl = {
  cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
  actionHandler: controlsUtils.scalingEqually,
  actionName: 'scaling',
}

export const createObjectDefaultControls = (): TControlSet => ({
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
      // todo: 支持反转的对象，始终保持在底部
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
    actionName: 'scaling',
    render: noop,
    positionHandler: positionHandlerH,
  }),

  mr: new Control({
    x: 0.5,
    y: 0,
    actionHandler: controlsUtils.scalingXOrSkewingY,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: 'scaling',
    render: noop,
    positionHandler: positionHandlerH,
  }),

  mb: new Control({
    x: 0,
    y: 0.5,
    actionHandler: controlsUtils.scalingYOrSkewingX,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: 'scaling',
    render: noop,
    positionHandler: positionHandlerV,
  }),

  mt: new Control({
    x: 0,
    y: -0.5,
    actionHandler: controlsUtils.scalingYOrSkewingX,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: 'scaling',
    render: noop,
    positionHandler: positionHandlerV,
  }),

  tl: new Control({
    x: -0.5,
    y: -0.5,
    ...getHornControl,
  }),

  tr: new Control({
    x: 0.5,
    y: -0.5,
    ...getHornControl,
  }),

  bl: new Control({
    x: -0.5,
    y: 0.5,
    ...getHornControl,
  }),

  br: new Control({
    x: 0.5,
    y: 0.5,
    ...getHornControl,
  }),
})

export const createResizeControls = (): TControlSet => ({
  mr: new Control({
    x: 0.5,
    y: 0,
    actionHandler: controlsUtils.changeWidth,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: 'resizing',
    render: noop,
    positionHandler: positionHandlerH,
  }),
  ml: new Control({
    x: -0.5,
    y: 0,
    actionHandler: controlsUtils.changeWidth,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: 'resizing',
    render: noop,
    positionHandler: positionHandlerH,
  }),
})

export const createTextboxDefaultControls = (): TControlSet => ({
  ...createObjectDefaultControls(),
  ...createResizeControls(),
})
