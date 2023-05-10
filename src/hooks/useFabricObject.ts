import { fabric } from '@/types'
import { MaybeRef, toRef } from '@vueuse/core'
import { toFixed } from '@/utils/math'
// import { useEditorModules } from '@/editor'

type AlignMethod =
  | 'alignLeft'
  | 'alignRight'
  | 'alignCenter'
  | 'verticalTop'
  | 'verticalMiddle'
  | 'verticalBottom'

export function useFabricObject<T extends fabric.FabricObject>(object: MaybeRef<T>) {
  // const { canvas } = useEditorModules()

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

  const align = (method: AlignMethod) => {
    const { left, top, width, height } = target.value
    if (!(target.value instanceof fabric.ActiveSelection)) return
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
    })
    target.value.canvas?.requestRenderAll()
  }

  return {
    getHeight,
    getWidth,
    setHeight,
    setWidth,
    alignLeft: () => align('alignLeft'),
    alignRight: () => align('alignRight'),
    alignCenter: () => align('alignCenter'),
    verticalTop: () => align('verticalTop'),
    verticalMiddle: () => align('verticalMiddle'),
    verticalBottom: () => align('verticalBottom'),
  }
}
