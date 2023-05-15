import { AlignMethod, fabric } from '@/types'
import { MaybeRef, toRef } from '@vueuse/core'
import { clampAngle, toFixed } from '@/utils/math'
// import { useEditorServices } from '@/core'

export function useFabricObject<T extends fabric.FabricObject>(object: MaybeRef<T>) {
  // const { canvas } = useEditorServices()

  const target = toRef(object)

  const getHeight = () => {
    return toFixed(target.value.getScaledHeight())
  }

  const getWidth = () => {
    return toFixed(target.value.getScaledWidth())
  }

  const setHeight = (value: number) => {
    target.value.set('scaleY', (value - target.value.strokeWidth) / target.value.height)
  }

  const setWidth = (value: number) => {
    target.value.set('scaleX', (value - target.value.strokeWidth) / target.value.width)
  }

  const setAngle = (value: number) => {
    target.value.rotate(toFixed(clampAngle(value)))
  }

  const setLeft = (value: number) => {
    target.value.setX(toFixed(value))
    target.value.getParent(true)?.setDirty()
  }

  const setTop = (value: number) => {
    target.value.setY(toFixed(value))
    target.value.getParent(true)?.setDirty()
  }

  const align = (method: AlignMethod) => {
    if (!(target.value instanceof fabric.ActiveSelection)) return
    const { left, top, width, height } = target.value
    const needUpdateGroup = new Set<fabric.Group>()
    target.value._objects.forEach((obj) => {
      switch (method) {
        case 'alignLeft':
          obj.setX(left)
          break
        case 'alignRight':
          obj.setX(left + width - obj.getScaledWidth())
          break
        case 'alignCenter':
          obj.setX(left + (width - obj.getScaledWidth()) / 2)
          break
        case 'verticalTop':
          obj.setY(top)
          break
        case 'verticalBottom':
          obj.setY(top + height - obj.getScaledHeight())
          break
        case 'verticalMiddle':
          obj.setY(top + (height - obj.getScaledHeight()) / 2)
          break
      }
      const group = obj.getParent(true)
      group && needUpdateGroup.add(group)
    })
    needUpdateGroup.forEach((group) => {
      group.setDirty()
    })
    target.value.canvas?.requestRenderAll()
  }

  return {
    getHeight,
    getWidth,
    setHeight,
    setWidth,
    setAngle,
    setLeft,
    setTop,
    alignLeft: () => align('alignLeft'),
    alignRight: () => align('alignRight'),
    alignCenter: () => align('alignCenter'),
    verticalTop: () => align('verticalTop'),
    verticalMiddle: () => align('verticalMiddle'),
    verticalBottom: () => align('verticalBottom'),
  }
}
