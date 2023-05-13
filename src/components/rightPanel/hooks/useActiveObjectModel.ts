import { useEditorServices } from '@/core/useEditor'
import { isDefined } from '@vueuse/core'
import { ObjectRef } from 'fabric'
import type { WritableComputedRef } from 'vue'
import { clampAngle, toFixed } from '@/utils/math'
import { isNumber } from 'lodash'

export const useActiveObjectModel = <K extends keyof ObjectRef, T extends ObjectRef[K]>(
  key: K,
): WritableComputedRef<{
  modelValue: T
  onChange: (value: T | undefined) => void
}> => {
  const { canvas } = useEditorServices()

  const modelValue = ref()

  watchEffect(() => {
    if (canvas.activeObject.value) {
      let value
      if (canvas.activeObject.value.group && (key === 'left' || key === 'top')) {
        value = canvas.activeObject.value.getXY()[key === 'left' ? 'x' : 'y']
      } else {
        value = canvas.activeObject.value[key]
      }
      modelValue.value = isNumber(value) ? toFixed(value) : value
    }
  })

  return computed(() => ({
    modelValue: modelValue.value as T,
    onChange: (newValue: T | undefined) => {
      if (!isDefined(canvas.activeObject)) return
      modelValue.value = newValue
      if (key === 'angle') {
        canvas.activeObject.value.rotate(toFixed(clampAngle(Number(modelValue.value))))
      } else if (canvas.activeObject.value.group && (key === 'left' || key === 'top')) {
        canvas.activeObject.value[key === 'left' ? 'setX' : 'setY'](
          toFixed(Number(modelValue.value)),
        )
        canvas.activeObject.value.setCoords()
      } else {
        canvas.activeObject.value.set(key, modelValue.value)
      }
      canvas.requestRenderAll()
    },
  }))
}
