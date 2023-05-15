import { useEditorServices } from '@/core/useEditor'
import { isDefined } from '@vueuse/core'
import { ObjectRef } from 'fabric'
import type { WritableComputedRef } from 'vue'
import { toFixed } from '@/utils/math'
import { isNumber } from 'lodash'
import { FabricObject, util } from '@/lib/fabric'
import { useFabricObject } from '@/hooks/useFabricObject'

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
    if (!isDefined(activeObject)) return
    lockChange = true
    let value

    if (['width', 'height'].includes(key)) {
      value = useFabricObject(activeObject.value)[key === 'width' ? 'getWidth' : 'getHeight']()
    } else if (['left', 'top'].includes(key) && activeObject.value.getParent(true)) {
      value = activeObject.value.getXY()[key === 'left' ? 'x' : 'y']
    } else if (key === 'opacity') {
      value = (activeObject.value[key] as number) * 100
    } else {
      value = activeObject.value[key]
    }
    modelValue.value = isNumber(value) ? toFixed(value) : value
    requestAnimationFrame(() => (lockChange = false))
  })

  const setObjectValue = (obj: FabricObject, newValue: any) => {
    if (key === 'opacity') {
      newValue = Number(newValue) / 100
    }
    if (obj.get(key) !== newValue) {
      obj.set(key, newValue)
    }
  }

  const fireSave = () => {
    if (!isDefined(activeObject)) return
    canvas.fire('object:modified', { target: activeObject.value })
  }

  const onChange = (newValue: T) => {
    if (lockChange || !isDefined(activeObject)) return

    if (['width', 'height', 'left', 'top', 'angle'].includes(key)) {
      // 左上宽高旋转
      useFabricObject(activeObject)[
        key === 'width'
          ? 'setWidth'
          : key === 'height'
          ? 'setHeight'
          : key === 'left'
          ? 'setLeft'
          : key === 'top'
          ? 'setTop'
          : 'setAngle'
      ](Number(newValue))
    } else if (
      !['left', 'top', 'visible', 'globalCompositeOperation'].includes(key) &&
      util.isCollection(activeObject.value)
    ) {
      // 在收集器内
      activeObject.value.forEachObject((obj) => {
        setObjectValue(obj, newValue)
      })
    } else {
      // 在收集器外
      setObjectValue(activeObject.value, newValue)
    }

    canvas.requestRenderAll()
  }

  return computed(() => ({
    modelValue: modelValue.value as T,
    onSwipe: (newValue: T) => {
      onChange(newValue)
    },
    onChange: (newValue: T) => {
      onChange(newValue)
      fireSave()
    },
  }))
}
