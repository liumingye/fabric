import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { KeybindingService, IKeybindingService } from '@/core/keybinding/keybindingService'
import { useFabricObject } from '@/hooks/useFabricObject'
import { ActiveSelection, FabricObject } from '@/lib/fabric'
import { isDefined } from '@vueuse/core'

export class Keybinding {
  private activeObject: ComputedRef<FabricObject | undefined>

  constructor(
    @IFabricCanvas private canvas: FabricCanvas,
    @IKeybindingService private keybindingServices: KeybindingService,
  ) {
    this.activeObject = computed(() => canvas.activeObject.value)

    this.keybindingServices.bind(['delete', 'backspace'], () => {
      if (!isDefined(this.activeObject)) return
      this.objForEach(this.activeObject.value, (obj) => {
        const group = obj.getParent()
        group.remove(obj)
      })
      canvas.discardActiveObject()
      canvas.requestRenderAll()
    })

    // 移至底层
    this.keybindingServices.bind('[', () => {
      if (!isDefined(this.activeObject)) return
      this.objForEach(this.activeObject.value, (obj) => {
        const group = obj.getParent()
        group.sendObjectToBack(obj)
      })
    })

    // 移至顶层
    this.keybindingServices.bind(']', () => {
      if (!isDefined(this.activeObject)) return
      this.objForEach(this.activeObject.value, (obj) => {
        const group = obj.getParent()
        group.bringObjectToFront(obj)
      })
    })

    // 向下移动一层
    this.keybindingServices.bind('mod+[', () => {
      if (!isDefined(this.activeObject)) return
      this.objForEach(this.activeObject.value, (obj) => {
        const group = obj.getParent()
        group.sendObjectBackwards(obj)
      })
    })

    // 向上移动一层
    this.keybindingServices.bind('mod+]', () => {
      if (!isDefined(this.activeObject)) return
      this.objForEach(this.activeObject.value, (obj) => {
        const group = obj.getParent()
        group.bringObjectForward(obj)
      })
    })

    this.bindAlign()
  }

  private bindAlign() {
    const object = () => {
      if (isDefined(this.activeObject)) {
        return useFabricObject(this.activeObject)
      }
    }
    this.keybindingServices.bind({
      'alt+a': () => object()?.alignLeft(),
      'alt+d': () => object()?.alignRight(),
      'alt+h': () => object()?.alignCenter(),
      'alt+w': () => object()?.verticalTop(),
      'alt+s': () => object()?.verticalBottom(),
      'alt+v': () => object()?.verticalMiddle(),
    })
  }

  private objForEach(target: FabricObject, fn: (obj: FabricObject) => void) {
    if (target instanceof ActiveSelection) {
      target.forEachObject((obj) => {
        fn(obj)
      })
    } else {
      fn(target)
    }
  }
}
