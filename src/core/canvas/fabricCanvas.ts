import { Canvas, Object as FabricObject, Point, TPointerEvent, util, Textbox } from '@fabric'
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

  public activeObject = shallowRef<FabricObject & Textbox>()

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
    activeSelection.add(...objects)
    this._hoveredTarget = activeSelection
    this._hoveredTargets = [...objects]
    this.setActiveObject(activeSelection)
  }

  /**
   * 根据ID查找对象
   * @param id 要查找的对象的ID
   * @returns 如果找到对象则返回一个FabricObject类型的对象，否则返回undefined
   */
  public findObjectById(id: string): FabricObject | undefined {
    const object = this.findObjectsByIds([id])
    return object.length ? object[0] : undefined
  }

  /**
   * 根据ID数组查找对象
   * @param ids 要查找的对象的ID数组
   * @returns 返回一个包含FabricObject类型对象的数组，数组中每个元素的值为对应的ID在对象集合中的对象。如果没有找到对象，则相应的数组元素值为undefined。
   */
  public findObjectsByIds(ids: string[]) {
    const result = Array(ids.length).fill(undefined)
    const stack = [...this._objects]
    while (stack.length) {
      const node = stack.pop()
      if (node) {
        const index = ids.indexOf(node.id)
        if (index !== -1) {
          result[index] = node
        }
      }
      if (util.isCollection(node)) {
        stack.push(...node._objects)
      }
    }
    return result
  }

  // 重写 取消 preserveObjectStacking 逻辑
  override findTarget(e: TPointerEvent): FabricObject | undefined {
    if (this.skipTargetFind) {
      return undefined
    }

    const pointer = this.getPointer(e, true),
      activeObject = this._activeObject,
      aObjects = this.getActiveObjects()

    this.targets = []

    if (activeObject && aObjects.length >= 1) {
      if (activeObject._findTargetCorner(pointer, util.isTouchEvent(e))) {
        // if we hit the corner of the active object, let's return that.
        return activeObject
      } else if (
        aObjects.length > 1 &&
        // check pointer is over active selection and possibly perform `subTargetCheck`
        this.searchPossibleTargets([activeObject], pointer)
      ) {
        // active selection does not select sub targets like normal groups
        return activeObject
      } else if (activeObject === this.searchPossibleTargets([activeObject], pointer)) {
        // active object is not an active selection
        // 取消 preserveObjectStacking 逻辑
        return activeObject
      }
    }

    return this.searchPossibleTargets(this._objects, pointer)
  }
}
