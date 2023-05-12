import mousetrap from 'mousetrap'
import { ActiveSelection, FabricObject, util } from '@/lib/fabric'
import { useFabricObject } from '@/hooks/useFabricObject'
import { FabricCanvas } from '../canvas/fabricCanvas'
import { isDefined } from '@vueuse/core'
import { createDecorator } from '@/core/instantiation/instantiation'
import { IFabricCanvas } from '@/core/canvas/fabricCanvas'

export const IKeybindingServices = createDecorator<KeybindingService>('keybindingServices')

export class KeybindingService extends mousetrap {
  private activeObject: ComputedRef<FabricObject | undefined>

  constructor(@IFabricCanvas canvas: FabricCanvas) {
    super()

    this.activeObject = computed(() => canvas.activeObject.value)

    const removeObject = (obj: FabricObject) => {
      if (obj instanceof ActiveSelection) {
        // 多个在ActiveSelection里
        obj.forEachObject((obj) => {
          // 第一个group是ActiveSelection，要删除俩次
          if (obj.group instanceof ActiveSelection) {
            obj.group.remove(obj)
          }
          removeObject(obj)
        })
      } else if (obj.group) {
        // 单个在Group里
        obj.group?.remove(obj)
      } else {
        // 单个在canvas里
        canvas.remove(obj)
      }
    }

    this.bind(['delete', 'backspace'], () => {
      if (!isDefined(this.activeObject)) return
      removeObject(this.activeObject.value)
      canvas.discardActiveObject()
      canvas.requestRenderAll()
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
