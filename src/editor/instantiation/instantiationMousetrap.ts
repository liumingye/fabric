import mousetrap from 'mousetrap'
import { FabricObject } from '@/lib/fabric'
import { useFabricObject } from '@/hooks/useFabricObject'
import { isDefined } from '@vueuse/core'
import { InstantiationCanvas } from './instantiationCanvas'

class InstantiationMousetrap extends mousetrap {
  private activeObject: ComputedRef<FabricObject | undefined>

  constructor(canvas: InstantiationCanvas) {
    super()

    this.activeObject = computed(() => canvas.activeObject.value)

    this.bind(['delete', 'backspace'], () => {
      if (!isDefined(this.activeObject)) return
      canvas.remove(this.activeObject.value)
    })

    // 移至底层
    this.bind('[', () => {
      if (!isDefined(this.activeObject)) return
      const collection = this.activeObject.value.group || canvas
      collection.sendObjectToBack(this.activeObject.value)
    })

    // 移至顶层
    this.bind(']', () => {
      if (!isDefined(this.activeObject)) return
      const collection = this.activeObject.value.group || canvas
      collection.bringObjectToFront(this.activeObject.value)
    })
    // 向下移动一层
    this.bind('mod+[', () => {
      if (!isDefined(this.activeObject)) return
      const collection = this.activeObject.value.group || canvas
      collection.sendObjectBackwards(this.activeObject.value)
    })
    // 向上移动一层
    this.bind('mod+]', () => {
      if (!isDefined(this.activeObject)) return
      const collection = this.activeObject.value.group || canvas
      collection.bringObjectForward(this.activeObject.value)
    })

    this.bindAlign()
  }

  bindAlign() {
    const object = () => {
      if (isDefined(this.activeObject)) {
        return useFabricObject(this.activeObject)
      }
    }
    this.bind('alt+a', () => object()?.alignLeft())
    this.bind('alt+d', () => object()?.alignRight())
    this.bind('alt+h', () => object()?.alignCenter())
    this.bind('alt+w', () => object()?.verticalTop())
    this.bind('alt+s', () => object()?.verticalBottom())
    this.bind('alt+v', () => object()?.verticalMiddle())
  }
}

export { InstantiationMousetrap }
