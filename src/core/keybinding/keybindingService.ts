import mousetrap from 'mousetrap'
import { ActiveSelection, FabricObject } from '@/lib/fabric'
import { useFabricObject } from '@/hooks/useFabricObject'
import { FabricCanvas } from '../canvas/fabricCanvas'
import { isDefined } from '@vueuse/core'
import { createDecorator } from '@/core/instantiation/instantiation'
import { IFabricCanvas } from '@/core/canvas/fabricCanvas'

export const IKeybindingService = createDecorator<KeybindingService>('keybindingServices')

export class KeybindingService extends mousetrap {
  private activeObject: ComputedRef<FabricObject | undefined>

  constructor(@IFabricCanvas canvas: FabricCanvas) {
    super()

    this.activeObject = computed(() => canvas.activeObject.value)

    const objForEach = (target: FabricObject, fn: (obj: FabricObject) => void) => {
      if (target instanceof ActiveSelection) {
        target.forEachObject((obj) => {
          fn(obj)
        })
      } else {
        fn(target)
      }
    }

    this.bind(['delete', 'backspace'], () => {
      if (!isDefined(this.activeObject)) return
      objForEach(this.activeObject.value, (obj) => {
        const group = obj.getParent()
        group.remove(obj)
      })
      canvas.discardActiveObject()
      canvas.requestRenderAll()
    })

    // 移至底层
    this.bind('[', () => {
      if (!isDefined(this.activeObject)) return
      objForEach(this.activeObject.value, (obj) => {
        const group = obj.getParent()
        group.sendObjectToBack(obj)
      })
    })

    // 移至顶层
    this.bind(']', () => {
      if (!isDefined(this.activeObject)) return
      objForEach(this.activeObject.value, (obj) => {
        const group = obj.getParent()
        group.bringObjectToFront(obj)
      })
    })

    // 向下移动一层
    this.bind('mod+[', () => {
      if (!isDefined(this.activeObject)) return
      objForEach(this.activeObject.value, (obj) => {
        const group = obj.getParent()
        group.sendObjectBackwards(obj)
      })
    })

    // 向上移动一层
    this.bind('mod+]', () => {
      if (!isDefined(this.activeObject)) return
      objForEach(this.activeObject.value, (obj) => {
        const group = obj.getParent()
        group.bringObjectForward(obj)
      })
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
