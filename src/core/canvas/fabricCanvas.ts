import { createCollectionMixin } from '@/core/canvas/Collection'
import { toRefObject } from '@/core/canvas/toRefObject'
import { EventbusService, IEventbusService } from '@/core/eventbus/eventbusService'
import { createDecorator } from '@/core/instantiation/instantiation'
import { IWorkspacesService, WorkspacesService } from '@/core/workspaces/workspacesService'
import { toFixed } from '@/utils/math'
import { randomText } from '@/utils/strings'
import {
  Board,
  Canvas,
  Object as FabricObject,
  ModifierKey,
  Point,
  TMat2D,
  TPointerEvent,
  Textbox,
  util,
} from '@fabric'
import { clamp } from '@vueuse/core'
import { isObject } from 'lodash'
import './mixin'

export const IFabricCanvas = createDecorator<FabricCanvas>('fabricCanvas')

export class FabricCanvas extends createCollectionMixin(Canvas) {
  declare readonly _serviceBrand: undefined

  public activeObject = shallowRef<FabricObject | Textbox>()

  public pageId: string

  private pages: Map<string, string | undefined> = new Map()

  public ref = {
    zoom: ref(toFixed(this.getZoom(), 2)),
    objects: computed(() => this._objects),
  }

  private uniqueIds = new Map<string, number>()

  constructor(
    @IWorkspacesService private readonly workspacesService: WorkspacesService,
    @IEventbusService private readonly eventbus: EventbusService,
    el?: string | HTMLCanvasElement,
    options?: Partial<Canvas>,
  ) {
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
    }

    this.on({
      'object:added': objectAdded,
    })

    // @ts-ignore
    this._activeSelection = toRefObject(this._activeSelection)

    // 响应式
    const objectsProxy = <K extends keyof FabricCanvas['ref']>(targetKey: any, refKey: K) => {
      return new Proxy(targetKey, {
        get: (target, key, receiver) => {
          const res = Reflect.get(target, key, receiver)
          // 分组对象
          if ((isObject(res) as any) && res._objects && !res._isRef_objects) {
            res._isRef_objects = true
            res._objects = objectsProxy(res._objects, 'objects')
          }
          return res
        },
        set: (target, key, value, receiver) => {
          const res = Reflect.set(target, key, value, receiver)
          triggerRef(this.ref[refKey])
          return res
        },
      })
    }
    this._objects = objectsProxy(this._objects, 'objects')

    this.pageId = this.workspacesService.getCurrentId()
    this.initWorkspace()
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
  }

  override setViewportTransform(vpt: TMat2D) {
    super.setViewportTransform(vpt)
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
    this._fireSelectionEvents([activeSelection])
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
  public findObjectsByIds(ids: string[]): (FabricObject | undefined)[] {
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

  // 重写 findTarget
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
      }

      const possibleTarget = this.searchPossibleTargets([activeObject], pointer)

      if (
        aObjects.length > 1 &&
        // check pointer is over active selection and possibly perform `subTargetCheck`
        possibleTarget
      ) {
        // active selection does not select sub targets like normal groups
        return activeObject
      } else if (activeObject === possibleTarget) {
        if (!this.preserveObjectStacking) {
          return activeObject
        } else {
          const subTargets = this.targets
          this.targets = []
          const target = this.searchPossibleTargets(this._objects, pointer)
          if (e[this.altSelectionKey as ModifierKey] && target && target !== activeObject) {
            // alt selection: select active object even though it is not the top most target
            // restore targets
            this.targets = subTargets
            return activeObject
          }
          return target || activeObject
        }
      }
    }

    return this.searchPossibleTargets(this._objects, pointer)
  }

  override searchPossibleTargets(
    objects: FabricObject[],
    pointer: Point,
  ): FabricObject | undefined {
    const target = this._searchPossibleTargets(objects, pointer)
    // if we found something in this.targets, and the group is interactive, return that subTarget
    // TODO: reverify why interactive. the target should be returned always, but selected only
    // if interactive.
    return target && util.isCollection(target) && target.interactive && this.targets.length > 0
      ? this.targets[this.targets.length - 1]
      : target
  }

  // 工作区 | 页面管理
  private initWorkspace() {
    this.workspacesService.all().forEach((workspace) => {
      this.setPageJSON(workspace.id, undefined)
    })
    this.eventbus.on('workspaceAdd', (id) => {
      this.setPageJSON(id, undefined)
    })
    this.eventbus.on('workspaceRemove', (id) => {
      this.pages.delete(id)
    })
    this.eventbus.on('workspaceChangeBefore', (id) => {
      // 切换前保存当前工作区
      if (this.pageId === id) {
        this.setPageJSON(id, this.toObject(['viewportTransform']))
      }
    })
    this.eventbus.on('workspaceChangeAfter', (id) => {
      // 切换后恢复当前工作区
      if (this.pageId !== id) {
        const json = this.pages.get(id)
        this.loadFromJSON(json || {}).then(() => {
          this.requestRenderAll()
          this.ref.zoom.value = toFixed(this.getZoom())
        })
        this.pageId = id
      }
    })
  }

  public setPageJSON(id: string, json: string | undefined) {
    this.pages.set(id, json)
  }

  public getPageJSON(id: string) {
    if (id === this.pageId) {
      return this.toObject(['viewportTransform'])
    }
    return this.pages.get(id) || '{}'
  }
}
