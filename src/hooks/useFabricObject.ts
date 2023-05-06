import type { fabric } from 'editor'

export function useFabricObject(object: fabric.Object) {
  const getHeight = () => {
    return object._getTransformedDimensions({
      strokeWidth: 0,
    }).x
  }

  const getWidth = () => {
    return object._getTransformedDimensions({
      strokeWidth: 0,
    }).y
  }

  const setHeight = (value: number) => {
    object.set('scaleX', value / object.height)
    object.setCoords()
  }

  const setWidth = (value: number) => {
    object.set('scaleY', value / object.width)
    object.setCoords()
  }

  return {
    getHeight,
    getWidth,
    setHeight,
    setWidth,
  }
}
