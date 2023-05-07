import { Object as FabricObject } from 'fabric'

Object.assign(FabricObject.ownDefaults, {
  strokeUniform: true,
  strokeWidth: 0,
  fill: '#CCC',
  cornerSize: 8,
  transparentCorners: false,
  cornerColor: '#FFF',
  borderColor: '#2A82E4',
  cornerStrokeColor: '#2A82E4',
  borderOpacityWhenMoving: 0,
} as FabricObject)

export { FabricObject }
