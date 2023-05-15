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
  const { activeObject } = canvas

  const modelValue = ref()

  // input组件在修改后不回车确定,切换object时,会触发onChange,导致修改错object值
  let lockChange = false

  watchEffect(() => {
    if (isDefined(activeObject)) {
      lockChange = true
      let value
      if ((key === 'left' || key === 'top') && activeObject.value.group) {
        value = activeObject.value.getXY()[key === 'left' ? 'x' : 'y']
      } else if (key === 'opacity') {
        value = (activeObject.value[key] as number) * 100
      } else {
        value = activeObject.value[key]
      }
      modelValue.value = isNumber(value) ? toFixed(value) : value
      requestAnimationFrame(() => (lockChange = false))
    }
  })

  const setValue = (obj: FabricObject, newValue: T) => {
    let value
    if (key === 'opacity') {
      value = Number(newValue) / 100
    } else {
      value = newValue
    }
    if (obj.get(key) !== value) {
      obj.set(key, value)
    }
  }

  return computed(() => ({
    modelValue: modelValue.value as T,
    onChange: (newValue: T) => {
      if (lockChange || !isDefined(activeObject)) return

      if (key === 'angle') {
        // 旋转
        activeObject.value.rotate(toFixed(clampAngle(Number(newValue))))
      } else if ((key === 'left' || key === 'top') && activeObject.value.group) {
        // 单个 组内 左和上
        activeObject.value[key === 'left' ? 'setX' : 'setY'](toFixed(Number(newValue)))
        activeObject.value.setCoords()
      } else if (
        !['width', 'height', 'left', 'top', 'visible', 'globalCompositeOperation'].includes(key) &&
        util.isCollection(activeObject.value)
      ) {
        // 多个 组内
        activeObject.value.forEachObject((obj) => {
          setValue(obj, newValue)
        })
      } else {
        // 组外
        setValue(activeObject.value, newValue)
      }

      canvas.requestRenderAll()
    },
  }))
}
