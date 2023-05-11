import { useEditorServices } from '@/editor/useEditor'
import { isDefined } from '@vueuse/core'
import type { ObjectRef } from 'fabric'
import type { WritableComputedRef } from 'vue'
import { clampAngle, toFixed } from '@/utils/math'

export const useActiveObjectModel = <K extends keyof ObjectRef, T extends ObjectRef[K]>(
  key: K,
): WritableComputedRef<T | undefined> => {
  const { canvas } = useEditorServices()

  return computed<T | undefined>({
    get() {
      if (!isDefined(canvas.activeObject)) return undefined
      return canvas.activeObject.value[key] as unknown as T
    },
    set(value) {
      if (isDefined(canvas.activeObject) && isDefined(canvas.activeObject.value[key])) {
        if (key === 'angle') {
          canvas.activeObject.value.rotate(toFixed(clampAngle(Number(value))))
          return
        }
        // @ts-ignore
        canvas.activeObject.value[key] = value
      }
    },
  })
}
