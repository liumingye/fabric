import { Group as GroupOrign, classRegistry } from 'fabric'
import { FabricObject } from '@/lib/fabric/fabric'
import { GroupProps } from 'fabric/src/shapes/Group'
// import { FabricCanvas } from '@/core/canvas/fabricCanvas'
import { toRefObject } from '@/core/canvas/toRefObject'

export class Group extends GroupOrign {
  public computed = {
    objects: computed(() => this._objects),
  }
  // public declare canvas: FabricCanvas | undefined

  constructor(
    objects?: FabricObject[],
    options?: Partial<GroupProps>,
    objectsRelativeToGroup?: boolean,
  ) {
    const newObjects = objects?.map((obj) => toRefObject(obj))

    super(newObjects, options as any, objectsRelativeToGroup)

    this.on({
      'object:added': () => {
        triggerRef(this.computed.objects)
        this.canvas && triggerRef(this.canvas.computed.objects)
      },
      'object:removed': () => {
        triggerRef(this.computed.objects)
        this.canvas && triggerRef(this.canvas.computed.objects)
      },
    })
  }

  public setDirty() {
    this._set('dirty', true)
  }

  /**
   * 图层位置改变
   */
  override _onStackOrderChanged() {
    super._onStackOrderChanged()
    // 更新objects
    triggerRef(this.computed.objects)
    this.canvas && triggerRef(this.canvas.computed.objects)
  }

  override add(...objects: FabricObject[]): number {
    const newObjects = objects.map((obj) => toRefObject(obj))
    // console.log(newObjects)
    return super.add(...newObjects)
  }

  override _onObjectAdded(obj: FabricObject) {
    if (!obj.get('noEventObjectAdded')) {
      super._onObjectAdded(obj)
    } else {
      obj._set('canvas', this)
    }
  }
}

classRegistry.setClass(Group)
classRegistry.setClass(Group, 'group')
