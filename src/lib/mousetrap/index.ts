import mousetrap from 'mousetrap'
import { useCanvasStore } from '@/store'
import { useFabricObject } from '@/hooks/useFabricObject'
import { isDefined } from '@vueuse/core'

export function initMousetrap() {
  const { activeObject } = storeToRefs(useCanvasStore())

  const object = () => {
    if (isDefined(activeObject)) {
      return useFabricObject(activeObject)
    }
  }

  mousetrap.bind('alt+a', () => object()?.alignLeft())
  mousetrap.bind('alt+d', () => object()?.alignRight())
  mousetrap.bind('alt+h', () => object()?.alignCenter())
  mousetrap.bind('alt+w', () => object()?.verticalTop())
  mousetrap.bind('alt+s', () => object()?.verticalBottom())
  mousetrap.bind('alt+v', () => object()?.verticalMiddle())
}
