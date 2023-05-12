import { Group as GroupOrign } from 'fabric'
import { FabricObject } from '@/lib/fabric/fabric'
import { GroupProps } from 'fabric/src/shapes/Group'
import { FabricCanvas } from '@/core/canvas/fabricCanvas'
import { toRefObject } from '@/core/canvas/toRefObject'

class Group extends GroupOrign {
  public objects = computed(() => this._objects)
  public declare canvas: FabricCanvas | undefined

  constructor(
    objects?: FabricObject[],
    options?: Partial<GroupProps>,
    objectsRelativeToGroup?: boolean,
  ) {
    const newObjects = objects?.map((obj) => toRefObject(obj))

    super(newObjects, options as any, objectsRelativeToGroup)

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

  /**
   * 图层位置改变
   */
  override _onStackOrderChanged() {
    super._onStackOrderChanged()
    // 更新objects
    this.canvas && triggerRef(this.canvas.objects)
  }

  override add(...objects: FabricObject[]): number {
    const newObjects = objects.map((obj) => toRefObject(obj))
    // console.log(newObjects)
    return super.add(...newObjects)
  }

  public updateLayoutStrategy() {
    this._applyLayoutStrategy({ type: 'object_modified' })
    this._set('dirty', true)
  }
}

export { Group }
