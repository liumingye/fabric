import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { KeybindingService, IKeybindingService } from '@/core/keybinding/keybindingService'
import { useFabricObject } from '@/hooks/useFabricObject'
import { ActiveSelection, FabricObject } from '@/lib/fabric'
import { AlignMethod } from '@/types'
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
    const align = (method: AlignMethod) => {
      if (!isDefined(this.activeObject)) return
      console.log(method)
      useFabricObject(this.activeObject)[method]()
      this.canvas.fire('object:modified', { target: this.activeObject.value })
    }
    this.keybindingServices.bind({
      'alt+a': () => align('alignLeft'),
      'alt+d': () => align('alignRight'),
      'alt+h': () => align('alignCenter'),
      'alt+w': () => align('verticalTop'),
      'alt+s': () => align('verticalBottom'),
      'alt+v': () => align('verticalMiddle'),
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
