import { Object as ObjectOrigin } from 'fabric'

Object.assign(ObjectOrigin.ownDefaults, {
  strokeUniform: true,
  strokeWidth: 0,
  fill: '#CCC',
  cornerSize: 8,
  transparentCorners: false,
  cornerColor: '#FFF',
  borderColor: '#2A82E4',
  cornerStrokeColor: '#2A82E4',
  borderOpacityWhenMoving: 0,
  // originX: 'left',
  // originY: 'top',
} as ObjectOrigin)
