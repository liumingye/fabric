import { useEditorServices } from '@/core/useEditor'
import { isDefined } from '@vueuse/core'
import { ObjectRef } from 'fabric'
import type { WritableComputedRef } from 'vue'
import { clampAngle, toFixed } from '@/utils/math'

export const useActiveObjectModel = <K extends keyof ObjectRef, T extends ObjectRef[K]>(
  key: K,
): WritableComputedRef<T | undefined> => {
  const { canvas } = useEditorServices()

  return computed<T | undefined>({
    // @ts-ignore
    get() {
      if (!isDefined(canvas.activeObject)) return undefined
      if (canvas.activeObject.value.group && (key === 'left' || key === 'top')) {
        // 下面的canvas.activeObject.value[key]用于触发更新勿删
        canvas.activeObject.value[key]
        return toFixed(canvas.activeObject.value.getBoundingRect()[key as 'left' | 'top'])
      }
      return canvas.activeObject.value[key]
    },
    set(value) {
      if (!isDefined(canvas.activeObject)) return
      if (key === 'angle') {
        canvas.activeObject.value.rotate(toFixed(clampAngle(Number(value))))
        return
      }
      if (canvas.activeObject.value.group && (key === 'left' || key === 'top')) {
        const oldValue = toFixed(canvas.activeObject.value.getBoundingRect()[key as 'left' | 'top'])
        const newValue = toFixed(Number(value))
        // 判断toFixed的新旧值是否相同，不判断的话，旋转元素会改变x和y，导致死循环
        if (oldValue !== newValue) {
          canvas.activeObject.value[key === 'left' ? 'setX' : 'setY'](newValue)
          // 使用setCoords，让get里的getBoundingRect获取正确
          canvas.activeObject.value.setCoords()
        }
        return
      }
      canvas.activeObject.value.set(key, value)
    },
  })
}
