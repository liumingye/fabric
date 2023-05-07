import mousetrap from 'mousetrap'
import { useCanvasStore } from '@/store'
import { useFabricObject } from '@/hooks/useFabricObject'
import { isDefined } from '@vueuse/core'

export function initMousetrap() {
  const { activeObject } = storeToRefs(useCanvasStore())

  const object = computed(() => {
    if (isDefined(activeObject)) {
      return useFabricObject(activeObject)
    }
  })

  mousetrap.bind('alt+a', () => object.value?.alignLeft())
  mousetrap.bind('alt+d', () => object.value?.alignRight())
  mousetrap.bind('alt+h', () => object.value?.alignCenter())
  mousetrap.bind('alt+w', () => object.value?.verticalTop())
  mousetrap.bind('alt+s', () => object.value?.verticalBottom())
  mousetrap.bind('alt+v', () => object.value?.verticalMiddle())
}
