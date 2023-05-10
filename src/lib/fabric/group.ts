import { Group as GroupOrign } from 'fabric'
import { FabricObject } from './fabric'
import { GroupProps } from 'fabric/src/shapes/Group'
import { FabricCanvas } from '@/editor/canvas/canvas'

class Group extends GroupOrign {
  public objects = computed(() => this._objects)
  public declare canvas: FabricCanvas | undefined

  constructor(
    objects?: FabricObject[],
    options?: Partial<GroupProps>,
    objectsRelativeToGroup?: boolean,
  ) {
    super(objects, options as any, objectsRelativeToGroup)

    this.on({
      'object:added': () => {
        triggerRef(this.objects)
        this.canvas && triggerRef(this.canvas.objects)
      },
      'object:removed': () => {
        triggerRef(this.objects)
        this.canvas && triggerRef(this.canvas.objects)
      },
    })
  }
}

export { Group }
