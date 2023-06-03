import { useEditor } from '@/app'
import { isDefined } from '@vueuse/core'
import { ObjectRef, Textbox } from '@fabric'
import { WritableComputedRef } from 'vue'
import { clampAngle, toFixed } from '@/utils/math'
import { isEqual, isNumber } from 'lodash'
import { FabricObject, util } from '@fabric'
import NP from 'number-precision'

export const useActiveObjectModel = <K extends keyof ObjectRef, T = ObjectRef[K] | undefined>(
  key: K,
): WritableComputedRef<{
  modelValue: T
  set: (value: T) => void
}> => {
  const { canvas } = useEditor()

  const modelValue = ref()

  // input组件在修改后不回车确定,切换object时,会触发onChange,导致修改错object值
  let lockChange = false

  watchEffect(
    () => {
      if (!isDefined(canvas.activeObject)) {
        modelValue.value = undefined
        return
      }

      const activeObject = canvas.activeObject.value as FabricObject & Textbox

      // 锁定修改
      lockChange = true

      let value
      if (['width', 'height'].includes(key)) {
        // 宽高
        value = activeObject[key === 'width' ? 'getWidth' : 'getHeight']()
      } else if (['left', 'top'].includes(key) && activeObject.getParent(true)) {
        // 左上
        value = activeObject.getLeftTop()[key === 'left' ? 'x' : 'y']
      } else if (key === 'opacity') {
        // 透明度
        value = NP.times(activeObject.opacity, 100)
      } else if (key === 'angle') {
        // 旋转
        value = clampAngle(activeObject.angle)
      } else if (key === 'fontSize') {
        // 字体大小
        let lastStyle = activeObject.getStyleAtPosition(0)[key]
        let allSameStyle = true
        for (let i = 1; i < activeObject.text.length; i++) {
          const thisStyle = activeObject.getStyleAtPosition(i)[key]
          if (!isEqual(thisStyle, lastStyle)) {
            allSameStyle = false
            break
          }
          lastStyle = thisStyle
        }
        if (!allSameStyle) {
          value = '多个值'
        } else {
          value = activeObject[key]
        }
      } else {
        // 其它
        value = activeObject[key]
      }
      modelValue.value = isNumber(value) ? toFixed(value) : value
      requestAnimationFrame(() => (lockChange = false))
    },
    {
      flush: 'post',
    },
  )

  const setObjectValue = (obj: FabricObject, newValue: any) => {
    if (key === 'opacity') {
      newValue = NP.divide(newValue, 100)
    }
    if (obj.get(key) !== newValue) {
      obj.set(key, newValue)
    }
  }

  /**
   * 更改值
   */
  const changeValue = (newValue: T, type: 'swipe' | 'change') => {
    const activeObject = canvas.activeObject.value as FabricObject & Textbox

    if (lockChange || !isDefined(activeObject)) return

    // 左上宽高旋转
    if (['width', 'height', 'left', 'top', 'angle'].includes(key)) {
      activeObject[
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
        activeObject.group?.updateLayout()
      }
    }
    // 文字
    else if (
      activeObject.isType<Textbox | Text>('Text', 'Textbox') &&
      ['fontSize'].includes(key) &&
      activeObject.selectionEnd - activeObject.selectionStart > 0
    ) {
      activeObject.setSelectionStyles({
        fontSize: newValue,
      })
    }
    // 组
    else if (
      util.isCollection(activeObject) &&
      // 排除要给组设置的属性
      !['left', 'top', 'visible', 'globalCompositeOperation', 'opacity'].includes(key)
    ) {
      activeObject.forEachObject((obj) => {
        setObjectValue(obj, newValue)
      })
    }
    // 其它
    else {
      setObjectValue(activeObject, newValue)
    }

    canvas.requestRenderAll()
  }

  const proxy = computed(() => ({
    disabled: !isDefined(canvas.activeObject.value),
    modelValue: modelValue.value as T,
    onSwipe: (value: T) => {
      changeValue(value, 'swipe')
    },
    set: (value: T) => {
      changeValue(value, 'change')
      // 保存历史
      if (!isDefined(canvas.activeObject)) return
      useEditor().undoRedo.saveState()
    },
    onChange: (value: T) => proxy.value.set(value),
  }))

  return proxy
}
