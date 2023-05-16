export declare module 'fabric' {
  import { Object as FabricObject, StaticCanvas } from 'fabric'

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

  // type Ancestors<Strict> = Strict extends true ? Group[] | undefined : (Group | Canvas)[]

  export class Object {
    group: Group | undefined
    id: string
    name: string
    ref: ObjectRef
    getParent<T extends boolean = false>(
      strict?: T,
    ): T extends true ? Group | undefined : Group | Canvas | StaticCanvas
    noEventObjectAdded: boolean
    // getAncestors<T extends boolean = false>(strict?: T): Ancestors<T>
  }

  export class Group {
    canvas: Canvas | undefined
    group: this | undefined
    _objects: FabricObject[]
    computed: {
      objects: ComputedRef<FabricObject[]>
    }
    setDirty(): void
    forEachObject(
      callback: (object: FabricObject, index: number, array: FabricObject[]) => any,
    ): void
  }
}
