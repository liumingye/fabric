import { AlignMethod } from 'app'
import { FabricObject } from '@fabric'
import 'fabric/src/typedefs'

export declare module 'fabric' {
  export declare type ObjectRef = Pick<
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

  export declare class Canvas {
    _objects: FabricObject[]
    computed: {
      objects: ComputedRef<FabricObject[]>
    }
    forEachObject(
      callback: (object: FabricObject, index: number, array: FabricObject[]) => any,
    ): void
    getActiveObject(): FabricObject | undefined
  }

  export declare class ActiveSelection {
    multiSelectAdd(...targets: FabricObject[]): void
    getObjects(...types: string[]): FabricObject[]
    forEachObject(
      callback: (object: FabricObject, index: number, array: FabricObject[]) => any,
    ): void
  }

  declare type AlignFunction = {
    [K in AlignMethod]: () => void
  }

  export declare interface Object extends AlignFunction {
    align(method: AlignMethod): void
  }

  export declare class Object {
    group: Group | undefined
    id: string
    name: string
    ref: ObjectRef
    getParent<T extends boolean = false>(
      strict?: T,
    ): T extends true ? Group | undefined : Group | Canvas | StaticCanvas
    noEventObjectAdded: boolean
    getHeight(): number
    getWidth(): number
    setHeight(height: number): void
    setWidth(width: number): void
    setAngle(angle: number): void
    setLeft(left: number): void
    setTop(top: number): void
  }

  export declare class Group {
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

  export declare class StaticCanvas {
    _objects: FabricObject[]
  }
}

export declare namespace fabric {
  export * from 'fabric'
  export * from 'fabric/src/typedefs'
}
