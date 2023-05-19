import { useEditor } from '@/app'
import { isDefined } from '@vueuse/core'
import { ObjectRef } from '@fabric'
import type { WritableComputedRef } from 'vue'
import { toFixed } from '@/utils/math'
import { isNumber } from 'lodash'
import { FabricObject, util } from '@fabric'

export const useActiveObjectModel = <K extends keyof ObjectRef, T = ObjectRef[K] | undefined>(
  key: K,
): WritableComputedRef<{
  modelValue: T
  onChange: (value: T) => void
}> => {
  const { canvas } = useEditor()
  const { activeObject } = canvas

  const modelValue = ref()

  // input组件在修改后不回车确定,切换object时,会触发onChange,导致修改错object值
  let lockChange = false

  watchEffect(() => {
    if (!isDefined(activeObject)) return
    // 锁定修改
    lockChange = true
    //
    let value
    if (['width', 'height'].includes(key)) {
      value = activeObject.value[key === 'width' ? 'getWidth' : 'getHeight']()
    } else if (['left', 'top'].includes(key) && activeObject.value.getParent(true)) {
      value = activeObject.value.getLeftTop()[key === 'left' ? 'x' : 'y']
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

  const saveState = () => {
    if (!isDefined(activeObject)) return
    useEditor().undoRedo.saveState()
  }

  const changeValue = (newValue: T, type: 'swipe' | 'change') => {
    if (lockChange || !isDefined(activeObject)) return

    if (['width', 'height', 'left', 'top', 'angle'].includes(key)) {
      // 左上宽高旋转
      activeObject.value[
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
      // 更改值后，更新组的布局
      if (type === 'change') {
        activeObject.value.group?.updateLayout()
      }
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
    onSwipe: (value: T) => {
      changeValue(value, 'swipe')
    },
    onChange: (value: T) => {
      changeValue(value, 'change')
      // 保存历史
      saveState()
    },
  }))
}
