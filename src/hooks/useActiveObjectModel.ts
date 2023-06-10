import { useEditor } from '@/app'
import { isDefined } from '@vueuse/core'
import { ObjectRef, Textbox, FabricObject, util, Rect } from '@fabric'
import { clampAngle, toFixed } from '@/utils/math'
import { isEqual, isNumber } from 'lodash'
import NP from 'number-precision'
import type { WritableComputedRef } from 'vue'

export const useActiveObjectModel = <K extends keyof ObjectRef, T = ObjectRef[K] | undefined>(
  key: K,
): WritableComputedRef<{
  modelValue: T
  onSwipe: (value: T) => void
  onChange: (value: T) => void
}> => {
  const { canvas } = useEditor()

  const modelValue = ref()

  // input组件在修改后不回车确定,切换object时,会触发onChange,导致修改错object值
  let lockChange = false

  watchEffect(() => {
    if (!isDefined(canvas.activeObject)) {
      modelValue.value = undefined
      return
    }

    const activeObject = canvas.activeObject.value as FabricObject & Textbox & Rect

    // 锁定修改
    lockChange = true

    let value
    switch (key) {
      case 'width':
        value = activeObject.getWidth()
        break

      case 'height':
        value = activeObject.getHeight()
        break

      case 'opacity':
        // 透明度
        value = NP.times(activeObject.opacity, 100)
        break

      case 'angle':
        // 旋转
        value = clampAngle(activeObject.angle)
        break

      case 'left':
        if (activeObject.getParent(true)) {
          value = activeObject.getLeftTop().x
        } else {
          value = activeObject.left
        }
        break

      case 'top':
        if (activeObject.getParent(true)) {
          value = activeObject.getLeftTop().y
        } else {
          value = activeObject.top
        }
        break

      case 'fontSize':
        if (util.isTextObject(activeObject)) {
          // 字体大小
          let lastStyle = activeObject.getStyleAtPosition(0).fontSize
          let allSameStyle = true
          for (let i = 1; i < activeObject.text.length; i++) {
            const thisStyle = activeObject.getStyleAtPosition(i).fontSize
            if (!isEqual(thisStyle, lastStyle)) {
              allSameStyle = false
              break
            }
            lastStyle = thisStyle
          }
          if (!allSameStyle) {
            value = '多个值'
          } else {
            value = activeObject.fontSize
          }
        } else {
          value = activeObject[key]
        }
        break

      default:
        value = activeObject[key]
        break
    }

    modelValue.value = isNumber(value) ? toFixed(value) : value
    requestAnimationFrame(() => (lockChange = false))
  })

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
      if (type === 'change' && activeObject.group?.updateLayout) {
        activeObject.group.updateLayout()
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

  return computed(() => ({
    disabled: !isDefined(canvas.activeObject.value),
    modelValue: modelValue.value as T,
    onSwipe: (value: T) => {
      changeValue(value, 'swipe')
    },
    onChange: (value: T) => {
      changeValue(value, 'change')
      // 保存历史
      if (!isDefined(canvas.activeObject)) return
      canvas.fire('object:modified', { target: canvas.activeObject.value })
    },
  }))
}
