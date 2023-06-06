import type { AlignMethod } from 'app'
import type { FabricObject, Point, TPointerEventInfo, TPointerEvent } from '@fabric'
import 'fabric/src/typedefs'

export declare module 'fabric' {
  export declare type ObjectRef = Pick<
    FabricObject,
    | 'id'
    | 'name'
    | 'hideOnLayer'
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
    | 'text'
    | 'charSpacing'
    | 'lineHeight'
    | 'fontSize'
    | 'fontWeight'
    | 'fontFamily'
    | 'fontStyle'
    | 'pathSide'
    | 'pathAlign'
    | 'underline'
    | 'overline'
    | 'linethrough'
    | 'textAlign'
    | 'direction'
  >

  export declare class Canvas {
    _objects: FabricObject[]
    ref: {
      zoom: Ref<number>
      objects: ComputedRef<FabricObject[]>
    }
    // computed: {
    //   objects: ComputedRef<FabricObject[]>
    // }
    forEachObject(
      callback: (object: FabricObject, index: number, array: FabricObject[]) => any,
    ): void
    getObjects(): FabricObject[]
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

  export declare class Group {
    canvas: Canvas | undefined
    group: this | undefined
    _objects: FabricObject[]
    setDirty(): void
    updateLayout(): void
    forEachObject(
      callback: (object: FabricObject, index: number, array: FabricObject[]) => any,
    ): void
    getObjects(): FabricObject[]
    onActiveTarget(target: FabricObject): void
    addDeselectedEvent(object: FabricObject): void
  }

  export declare class Object {
    group: Group | undefined
    id: string
    name: string
    ref: ObjectRef
    getParent<T extends boolean = false>(
      strict?: T,
    ): T extends true ? Group | undefined : Group | Canvas | StaticCanvas
    /** 不发送 object:added 事件 */
    noEventObjectAdded: boolean
    getWidthHeight(): Point
    getHeight(): number
    getWidth(): number
    getLeftTop(): Point
    getLeft(): number
    getTop(): number
    setHeight(height: number): void
    setWidth(width: number): void
    setAngle(angle: number): void
    setLeftTop(point: Point): void
    setLeft(left: number): void
    setTop(top: number): void
    toObject(propertiesToInclude?: any[]): any
    _type: string
    type: string
    isType<T = boolean>(...types: string[]): this is T
    /** 在图层上隐藏 */
    hideOnLayer: boolean
  }

  export declare class StaticCanvas {
    _objects: FabricObject[]
    getObjects(): FabricObject[]
  }
}

export declare namespace fabric {
  export * from 'fabric'
  export * from 'fabric/src/typedefs'
}
