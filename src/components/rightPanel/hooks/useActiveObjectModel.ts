import { useEditorServices } from '@/core/useEditor'
import { isDefined } from '@vueuse/core'
import { ObjectRef } from 'fabric'
import type { WritableComputedRef } from 'vue'
import { clampAngle, toFixed } from '@/utils/math'
import { isNumber } from 'lodash'
import { FabricObject, util } from '@/lib/fabric'

export const useActiveObjectModel = <K extends keyof ObjectRef, T = ObjectRef[K] | undefined>(
  key: K,
): WritableComputedRef<{
  modelValue: T
  onChange: (value: T) => void
}> => {
  const { canvas } = useEditorServices()

  const modelValue = ref()

  watchEffect(() => {
    if (canvas.activeObject.value) {
      let value
      if ((key === 'left' || key === 'top') && canvas.activeObject.value.group) {
        value = canvas.activeObject.value.getXY()[key === 'left' ? 'x' : 'y']
      } else if (key === 'opacity') {
        value = (canvas.activeObject.value[key] as number) * 100
      } else {
        value = canvas.activeObject.value[key]
      }
      modelValue.value = isNumber(value) ? toFixed(value) : value
    }
  })

  return computed(() => ({
    modelValue: modelValue.value as T,
    onChange: (newValue: T) => {
      if (!isDefined(canvas.activeObject)) return
      modelValue.value = newValue
      if (key === 'angle') {
        canvas.activeObject.value.rotate(toFixed(clampAngle(Number(modelValue.value))))
        canvas.requestRenderAll()
        return
      } else if ((key === 'left' || key === 'top') && canvas.activeObject.value.group) {
        canvas.activeObject.value[key === 'left' ? 'setX' : 'setY'](
          toFixed(Number(modelValue.value)),
        )
        canvas.activeObject.value.setCoords()
        canvas.requestRenderAll()
        return
      }

      // console.log(123)

      const setValue = (obj: FabricObject | undefined) => {
        if (!isDefined(obj)) return
        if (key === 'opacity') {
          obj.set(key, modelValue.value / 100)
        } else {
          obj.set(key, modelValue.value)
        }
      }

      if (
        !['width', 'height', 'left', 'top'].includes(key) &&
        util.isCollection(canvas.activeObject.value)
      ) {
        canvas.activeObject.value.forEachObject((obj) => {
          setValue(obj)
        })
      } else {
        setValue(canvas.activeObject.value)
      }

      canvas.requestRenderAll()
    },
  }))
}
