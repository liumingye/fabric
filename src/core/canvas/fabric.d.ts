export declare module 'fabric' {
  import { Object as FabricObject } from 'fabric'

  export type ObjectRef = Pick<
    FabricObject,
    | 'id'
    | 'name'
    | 'originX'
    | 'originY'
    | 'top'
    | 'left'
    | 'width'
    | 'height'
    | 'scaleX'
    | 'scaleY'
    | 'flipX'
    | 'flipY'
    | 'opacity'
    | 'angle'
    | 'skewX'
    | 'skewY'
    | 'cornerSize'
    | 'touchCornerSize'
    | 'transparentCorners'
    | 'hoverCursor'
    | 'moveCursor'
    | 'padding'
    | 'borderColor'
    | 'borderDashArray'
    | 'cornerColor'
    | 'cornerStrokeColor'
    | 'cornerStyle'
    | 'cornerDashArray'
    | 'centeredScaling'
    | 'centeredRotation'
    | 'fill'
    | 'fillRule'
    | 'globalCompositeOperation'
    | 'backgroundColor'
    | 'selectionBackgroundColor'
    | 'stroke'
    | 'strokeWidth'
    | 'strokeDashArray'
    | 'strokeDashOffset'
    | 'strokeLineCap'
    | 'strokeLineJoin'
    | 'strokeMiterLimit'
    | 'shadow'
    | 'borderOpacityWhenMoving'
    | 'borderScaleFactor'
    | 'minScaleLimit'
    | 'selectable'
    | 'evented'
    | 'visible'
    | 'hasControls'
    | 'hasBorders'
    | 'perPixelTargetFind'
    | 'includeDefaultValues'
    | 'lockMovementX'
    | 'lockMovementY'
    | 'lockRotation'
    | 'lockScalingX'
    | 'lockScalingY'
    | 'lockSkewingX'
    | 'lockSkewingY'
    | 'lockScalingFlip'
    | 'excludeFromExport'
    | 'objectCaching'
    | 'noScaleCache'
    | 'strokeUniform'
    | 'dirty'
    | 'paintFirst'
    | 'activeOn'
    | 'colorProperties'
    | 'inverted'
    | 'absolutePositioned'
  >

  export class Canvas {
    _objects: FabricObject[]
    computed: {
      objects: ComputedRef<FabricObject[]>
    }
    forEachObject(
      callback: (object: FabricObject, index: number, array: FabricObject[]) => any,
    ): void
  }

  export class Object {
    group: Group | undefined
    id: string
    name: string
    ref: ObjectRef
  }

  export class Group {
    group: this | undefined
    _objects: FabricObject[]
    computed: {
      objects: ComputedRef<FabricObject[]>
    }
    updateLayoutStrategy(): void
    forEachObject(
      callback: (object: FabricObject, index: number, array: FabricObject[]) => any,
    ): void
  }
}
