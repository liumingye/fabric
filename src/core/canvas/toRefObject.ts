import { FabricObject, ObjectRef } from '@/lib/fabric'

const toRefObject = (object: FabricObject) => {
  if (object.ref) return object

  const keyArr: (keyof ObjectRef)[] = [
    'id',
    'name',
    'originX',
    'originY',
    'top',
    'left',
    'width',
    'height',
    'scaleX',
    'scaleY',
    'flipX',
    'flipY',
    'opacity',
    'angle',
    'skewX',
    'skewY',
    'cornerSize',
    'touchCornerSize',
    'transparentCorners',
    'hoverCursor',
    'moveCursor',
    'padding',
    'borderColor',
    'borderDashArray',
    'cornerColor',
    'cornerStrokeColor',
    'cornerStyle',
    'cornerDashArray',
    'centeredScaling',
    'centeredRotation',
    'fill',
    'fillRule',
    'globalCompositeOperation',
    'backgroundColor',
    'selectionBackgroundColor',
    'stroke',
    'strokeWidth',
    'strokeDashArray',
    'strokeDashOffset',
    'strokeLineCap',
    'strokeLineJoin',
    'strokeMiterLimit',
    'shadow',
    'borderOpacityWhenMoving',
    'borderScaleFactor',
    'minScaleLimit',
    'selectable',
    'evented',
    'visible',
    'hasControls',
    'hasBorders',
    'perPixelTargetFind',
    'includeDefaultValues',
    'lockMovementX',
    'lockMovementY',
    'lockRotation',
    'lockScalingX',
    'lockScalingY',
    'lockSkewingX',
    'lockSkewingY',
    'lockScalingFlip',
    'excludeFromExport',
    'objectCaching',
    'noScaleCache',
    'strokeUniform',
    'dirty',
    'paintFirst',
    'activeOn',
    'colorProperties',
    'inverted',
    'absolutePositioned',
  ]

  object.ref = reactive({}) as any

  keyArr.forEach((key) => {
    // @ts-ignore
    object.ref[key] = object[key]

    Object.defineProperty(object, key, {
      get() {
        return this.ref[key]
      },
      set(value) {
        this.ref[key] = value
      },
    })
  })

  return object
}

export { toRefObject }
