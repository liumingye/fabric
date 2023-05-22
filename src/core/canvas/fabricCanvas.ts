import { Canvas, Object as FabricObject, Point, util } from '@fabric'
import { randomText } from '@/utils/strings'
import { createDecorator } from '@/core/instantiation/instantiation'
import { toRefObject } from '@/core/canvas/toRefObject'
import { clamp } from '@vueuse/core'
import { toFixed } from '@/utils/math'
import { createCollectionMixin } from '@/core/canvas/Collection'
import './mixin'

export const IFabricCanvas = createDecorator<IFabricCanvas>('fabricCanvas')

export interface IFabricCanvas extends FabricCanvas {
  readonly _serviceBrand: undefined
}

export class FabricCanvas extends createCollectionMixin(Canvas) {
  declare readonly _serviceBrand: undefined

  public activeObject = shallowRef<FabricObject>()

  public ref = {
    zoom: ref(toFixed(this.getZoom(), 2)),
  }

  public computed = {
    objects: computed(() => this._objects),
  }

  private uniqueIds = new Map<string, number>()

  constructor(el?: string | HTMLCanvasElement, options?: Partial<Canvas>) {
    const createCanvasElement = () => document.createElement('canvas')
    super(
      el || createCanvasElement(),
      Object.assign(
        {
          hoverCursor: 'default',
          preserveObjectStacking: true,
          selectionBorderColor: 'rgba(60,126,255,0.8)',
          selectionColor: 'rgba(60,126,255,0.2)',
          uniformScaling: false,
          stopContextMenu: true,
          fireMiddleClick: true,
          includeDefaultValues: false,
          // selectionFullyContained: true,
        },
        options,
      ),
    )

    const setDefaultAttr = (target: FabricObject) => {
      // 添加名称
      // todo 临时方法 findFirstMissingPositive
      if (!target.name) {
        const className = target.constructor.name
        const id = this.uniqueIds.get(className) || 1
        target.set({
          name: `${className} ${id}`,
        })
        this.uniqueIds.set(className, id + 1)
      }
      // 添加id
      if (!target.id) {
        target.set({
          id: randomText(),
        })
      }
      console.log(target)
    }

    const objectAdded = ({ target }: { target: FabricObject }) => {
      setDefaultAttr(target)
      if (util.isCollection(target)) {
        target.forEachObject((obj) => {
          setDefaultAttr(obj)
        })
        target.on('object:added', objectAdded)
      }
      triggerRef(this.computed.objects)
    }

    this.on({
      'object:added': objectAdded,
      'object:removed': () => triggerRef(this.computed.objects),
    })

    // @ts-ignore
    this._activeSelection = toRefObject(this._activeSelection)
  }

  // @ts-ignore
  override get _activeObject() {
    return this.activeObject.value
  }

  override set _activeObject(value) {
    this.activeObject.value = value
  }

  override zoomToPoint(point: Point, value: number) {
    value = clamp(value, 0.02, 256)
    super.zoomToPoint(point, value)
    this.ref.zoom.value = toFixed(this.getZoom(), 2)
  }

  public setActiveObjects(objects: FabricObject[]) {
    if (objects.length === 0) {
      this.discardActiveObject()
      return
    }
    if (objects.length === 1) {
      this.setActiveObject(objects[0])
      return
    }
    const activeSelection = this.getActiveSelection()
    activeSelection.removeAll()
    activeSelection.multiSelectAdd(...objects)
    this._hoveredTarget = activeSelection
    this._hoveredTargets = [...objects]
    this.setActiveObject(activeSelection)
  }

  public findObjectById(id: string) {
    const stack = [...this._objects]
    while (stack.length) {
      const node = stack.pop()
      if (node?.id === id) {
        return node
      }
      if (util.isCollection(node)) {
        stack.push(...node._objects)
      }
    }
    return undefined
  }
}
