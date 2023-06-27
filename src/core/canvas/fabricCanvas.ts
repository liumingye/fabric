import { createCollectionMixin } from '@/core/canvas/Collection'
import { toRefObject } from '@/core/canvas/toRefObject'
import { EventbusService, IEventbusService } from '@/core/eventbus/eventbusService'
import { createDecorator } from '@/core/instantiation/instantiation'
import { IWorkspacesService, WorkspacesService } from '@/core/workspaces/workspacesService'
import { toFixed } from '@/utils/math'
import { LinkedList } from '@/utils/linkedList'
import {
  Canvas,
  FabricObject,
  Group,
  Point,
  TMat2D,
  TPointerEvent,
  Textbox,
  util,
  Board,
  iMatrix,
} from '@fabric'
import { clamp } from '@vueuse/core'
import { runWhenIdle } from '@/utils/async'
import { debounce } from 'lodash'
import './mixin'

export const IFabricCanvas = createDecorator<FabricCanvas>('fabricCanvas')

interface Page {
  _objects: FabricObject[]
  viewportTransform: TMat2D
}

export class FabricCanvas extends createCollectionMixin(Canvas) {
  declare readonly _serviceBrand: undefined

  public activeObject = shallowRef<FabricObject | Textbox>()

  public pageId: string

  private readonly pages: Map<string, Page> = new Map()

  public readonly ref = {
    zoom: ref(toFixed(this.getZoom(), 2)),
    objects: computed(() => this._objects),
  }

  constructor(
    @IWorkspacesService private readonly workspacesService: WorkspacesService,
    @IEventbusService private readonly eventbus: EventbusService,
  ) {
    const createCanvasElement = () => document.createElement('canvas')
    super(
      createCanvasElement(),
      Object.assign({
        hoverCursor: 'default',
        preserveObjectStacking: true,
        selectionBorderColor: 'rgba(60,126,255,0.8)',
        selectionColor: 'rgba(60,126,255,0.2)',
        uniformScaling: false,
        stopContextMenu: true,
        fireMiddleClick: true,
        includeDefaultValues: false,
      }),
    )

    delete this._activeObject
    // @ts-ignore
    delete this._objects

    // 初始化激活选区
    this.initActiveSelection()

    // 初始化画板
    this.initBoard()

    this.pageId = this.workspacesService.getCurrentId()
    this.initWorkspace()
  }

  // @ts-ignore
  public get _activeObject() {
    return this.activeObject.value
  }

  public set _activeObject(value) {
    this.activeObject.value = value
  }

  // @ts-ignore
  public get _objects() {
    const id = this.workspacesService.getCurrentId()
    if (!this.pages.has(id)) {
      this.setPageJSON(id, [])
    }
    return this.pages.get(id)?._objects || []
  }

  public set _objects(value) {
    const id = this.workspacesService.getCurrentId()
    this.setPageJSON(id, value)
  }

  override zoomToPoint(point: Point, value: number, skipSetCoords?: boolean) {
    value = clamp(value, 0.02, 256)
    const before = point,
      vpt: TMat2D = [...this.viewportTransform]
    const newPoint = util.transformPoint(point, util.invertTransform(vpt))
    vpt[0] = value
    vpt[3] = value
    const after = util.transformPoint(newPoint, vpt)
    vpt[4] += before.x - after.x
    vpt[5] += before.y - after.y
    if (skipSetCoords) {
      this.viewportTransform = vpt
      this.renderOnAddRemove && this.requestRenderAll()
    } else {
      this.setViewportTransform(vpt)
    }
  }

  private setCoordsStack = new LinkedList<FabricObject>()

  private _setCoords = debounce(() => {
    const backgroundObject = this.backgroundImage,
      overlayObject = this.overlayImage,
      len = this._objects.length

    if (!this.setCoordsStack.isEmpty()) {
      this.setCoordsStack.clear()
    }
    for (let i = 0; i < len; i++) {
      this.setCoordsStack.push(this._objects[i])
    }

    runWhenIdle(() => {
      while (!this.setCoordsStack.isEmpty()) {
        const object = this.setCoordsStack.shift()
        if (object) {
          object.group || object.setCoords()
        }
      }
      if (backgroundObject) {
        backgroundObject.setCoords()
      }
      if (overlayObject) {
        overlayObject.setCoords()
      }
      this.calcViewportBoundaries()
    })
  }, 50)

  override setViewportTransform(vpt: TMat2D) {
    this.viewportTransform = vpt
    this._setCoords()
    this.renderOnAddRemove && this.requestRenderAll()
    this.ref.zoom.value = toFixed(this.getZoom(), 2)
  }

  override setActiveObject(object: FabricObject, e?: TPointerEvent) {
    const group = object.group
    if (group && group instanceof Group) {
      group.onActiveTarget(object)
    }
    return super.setActiveObject(object, e)
  }

  public setActiveObjects(objects: FabricObject[]) {
    if (objects.length === 0) {
      this.discardActiveObject()
      this.requestRenderAll()
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
  public findObjectById(id: string | number): FabricObject | undefined {
    const object = this.findObjectsByIds([id])
    return object[0]
  }

  /**
   * 根据ID数组查找对象
   * @param idsToFind 要查找的对象的ID数组
   * @returns 返回一个包含FabricObject类型对象的数组，数组中每个元素的值为对应的ID在对象集合中的对象。如果没有找到对象，则相应的数组元素值为undefined。
   */
  public findObjectsByIds(idsToFind: (string | number)[]): (FabricObject | undefined)[] {
    const size = idsToFind.length
    const foundObjects = Array(size).fill(undefined)
    let numFound = 0
    const stack = new LinkedList<FabricObject>()
    const pushObjectsToStack = (objects: FabricObject[]) => {
      for (const object of objects) {
        stack.push(object)
      }
    }
    // 压入全部元素
    pushObjectsToStack(this._objects)
    while (!stack.isEmpty() && numFound < size) {
      // 出栈
      const currentObject = stack.pop()
      if (currentObject) {
        const index = idsToFind.indexOf(currentObject.id)
        if (index !== -1) {
          foundObjects[index] = currentObject
          numFound++
        }
      }
      // 压入组内元素
      if (util.isCollection(currentObject)) {
        pushObjectsToStack(currentObject._objects)
      }
    }
    return foundObjects
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
        return activeObject
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
    if (target && util.isCollection(target) && target.interactive && this.targets.length > 0) {
      const targetIndex = this.targets.findIndex((t) => t.group?.interactive)
      return targetIndex >= 0 ? this.targets[targetIndex] : this.targets[0]
    }
    return target
  }

  // 工作区 | 页面管理
  private initWorkspace() {
    this.workspacesService.all().forEach((workspace) => {
      this.setPageJSON(workspace.id, [])
    })
    this.eventbus.on('workspaceAddAfter', ({ newId }) => {
      this.setPageJSON(newId, [])
    })
    this.eventbus.on('workspaceRemoveAfter', (id) => {
      this.pages.delete(id)
    })
    this.eventbus.on('workspaceChangeAfter', ({ newId }) => {
      // 切换后恢复当前工作区
      if (this.pageId !== newId) {
        this.discardActiveObject()
        this._objectsToRender = undefined
        this.setViewportTransform(this.pages.get(newId)?.viewportTransform || iMatrix)
        // 由于_objects数组改变了，需要执行调度器
        if (this.ref.objects.effect.scheduler) {
          this.ref.objects.effect.scheduler()
        } else {
          this.ref.objects.effect.run()
        }
        this.pageId = newId
      }
    })
  }

  public setPageJSON(id: string, _objects: FabricObject[]) {
    this.pages.set(id, {
      _objects,
      viewportTransform: this.viewportTransform,
    })
  }

  public getPageJSON(id: string): Page | undefined {
    if (id === this.pageId) {
      return {
        _objects: this._objects,
        viewportTransform: this.viewportTransform,
      }
    }
    return this.pages.get(id)
  }

  /**
   * 初始化激活选区
   */
  private initActiveSelection() {
    // @ts-ignore
    this._activeSelection = toRefObject(this._activeSelection)
    this._activeSelection.subTargetCheck = true
    // 单击选中当前元素
    this._activeSelection.on('mouseup', (e) => {
      if (
        e.isClick &&
        !this._activeSelection.isMoving &&
        !this._isSelectionKeyPressed(e.e) &&
        e.subTargets &&
        e.subTargets.length > 0
      ) {
        this.setActiveObject(e.subTargets[e.subTargets.length - 1])
        this.requestRenderAll()
      }
    })
    // 更新激活选区元素内的组
    const updateGroup = () => {
      const needUpdateGroup = new Set<Group>()
      // 收集需要更新的组
      this._activeSelection.forEachObject((obj) => {
        const group = obj.getParent(true)
        group && needUpdateGroup.add(group)
      })
      // 开始更新组
      needUpdateGroup.forEach((group) => {
        group.setDirty()
      })
    }
    this._activeSelection.on({
      modified: updateGroup,
      moving: updateGroup,
      scaling: updateGroup,
      skewing: updateGroup,
      // @ts-ignore
      changed: updateGroup,
    })
  }

  override absolutePan(point: Point, skipSetCoords?: boolean) {
    const vpt: TMat2D = [...this.viewportTransform]
    vpt[4] = -point.x
    vpt[5] = -point.y
    // 执行 setCoords 导致卡顿，添加一个跳过属性
    if (skipSetCoords) {
      this.viewportTransform = vpt
      this._cacheBoards?.forEach((board) => {
        FabricObject.prototype.setCoords.call(board)
      })
      this.requestRenderAll()
      return
    }
    this.setViewportTransform(vpt)
  }

  /**
   * Pans viewpoint relatively
   * @param {Point} point (position vector) to move by
   */
  override relativePan(point: Point, skipSetCoords?: boolean) {
    return this.absolutePan(
      new Point(-point.x - this.viewportTransform[4], -point.y - this.viewportTransform[5]),
      skipSetCoords,
    )
  }

  private _cacheBoards: FabricObject[] | undefined

  private _cacheCurrentBoard: Group | undefined

  /**
   * 初始化画板
   */
  private initBoard() {
    this.on('mouse:move', ({ e, target, absolutePointer }) => {
      if (!target || !target.isMoving || util.isBoard(target)) return

      if (!this._cacheBoards) {
        this._cacheBoards = this.getObjects('Board').filter((board) => board !== target)

        this.once('mouse:up', () => {
          this._cacheBoards = undefined
          this._cacheCurrentBoard = undefined
        })
      }

      if (this._cacheBoards.length === 0) {
        return
      }

      // 获取当前鼠标坐标下Board
      this.targets = []
      const board = this._searchPossibleTargets(this._cacheBoards, absolutePointer) as
        | Group
        | undefined

      // console.log(board?.name)
      // 和缓存对象没有变化，则返回
      if (board === this._cacheCurrentBoard) return

      this._cacheCurrentBoard = board

      if (util.isActiveSelection(target)) {
        const hasBoard = target._objects.some((obj) => util.isBoard(obj))
        if (hasBoard) return

        const length = target._objects.length
        let needSetCoords = false
        for (let index = length - 1; index >= 0; index--) {
          const obj = target._objects[index]
          if (obj.__owningGroup !== board) {
            // exit ActiveSelection
            obj.group?.remove(obj)
            // exit Group
            const [object] = obj.getParent().remove(obj) as FabricObject[]
            // add Board or Canvas
            ;(board || this).add(object)
            object.__owningGroup = board
            // enter ActiveSelection
            this._activeSelection.insertAt(index, object)
            needSetCoords = true
          }
        }
        if (needSetCoords) {
          this._activeSelection.setCoords()
        }
        return
      }

      // todo 待优化
      if (!board || !target.getAncestors(true).includes(board)) {
        // 出画板
        if (target.group) {
          const [object] = target.group.remove(target) as FabricObject[]
          target.group?.setDirty()

          if (!board) {
            this.add(object)
          } else {
            ;(board as Board).add(object)
            ;(board as Board).setDirty()
          }

          this._setupCurrentTransform(e, object, false)
          this.setActiveObject(object)
        }
        // 进画板
        else if (board && target !== board) {
          const [object] = target.getParent().remove(target) as FabricObject[]
          ;(board as Board).add(object)
          ;(board as Board).setDirty()
          this._setupCurrentTransform(e, object, false)
          this.setActiveObject(object)
        }
      }
    })
  }
}
