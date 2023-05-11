import { useMagicKeys, clamp, UseMagicKeysReturn } from '@vueuse/core'
import { Canvas, Object as FabricObject, Point, util } from '@/lib/fabric'
import { randomText } from '@/utils/strings'
import { createDecorator } from '@/editor/instantiation/instantiation'
import { toRefObject } from '@/editor/canvas/toRefObject'

export const IFabricCanvas = createDecorator<FabricCanvas>('fabricCanvas')

class FabricCanvas extends Canvas {
  public activeObject = shallowRef<FabricObject>()
  public objects = computed(() => this._objects)
  private magicKeys: UseMagicKeysReturn<false>
  private uniqueIds = new Map<string, number>()

  constructor(el?: string | HTMLCanvasElement, options?: Partial<Canvas>) {
    const createCanvasElement = () => document.createElement('canvas')
    super(
      el || createCanvasElement(),
      Object.assign(
        {
          hoverCursor: 'default',
          preserveObjectStacking: true,
          selectionBorderColor: 'rgba(42,130,228,0.8)',
          selectionColor: 'rgba(42,130,228,0.2)',
          uniformScaling: false,
          stopContextMenu: true,
          fireMiddleClick: true,
        },
        options,
      ),
    )

    const setDefaultAttr = (target: FabricObject) => {
      // 添加名称
      // todo 临时方法 findFirstMissingPositive
      if (!target.get('name')) {
        const className = target.constructor.name
        const id = this.uniqueIds.get(className) || 1
        target.set({
          name: `${className} ${id}`,
        })
        this.uniqueIds.set(className, id + 1)
      }
      // 添加id
      target.set({
        id: randomText(),
      })
    }

    const objectAdded = ({ target }: { target: FabricObject }) => {
      setDefaultAttr(target)
      if (util.isCollection(target)) {
        target._objects.forEach((obj) => {
          setDefaultAttr(obj as FabricObject)
        })
        target.on('object:added', objectAdded)
      }
      triggerRef(this.objects)
    }

    this.on({
      'object:added': objectAdded,
      'object:removed': () => triggerRef(this.objects),
    })

    this.magicKeys = useMagicKeys()

    this.initMouseWheel()

    // @ts-ignore
    this._activeSelection = toRefObject(this._activeSelection)
  }

  /**
   * 初始化滚动和缩放
   */
  private initMouseWheel() {
    // 默认纵向滚动 shift横向滚动 ctrl缩放
    this.on('mouse:wheel', (e) => {
      e.e.preventDefault()
      e.e.stopPropagation()
      const { deltaX, deltaY, offsetX, offsetY } = e.e
      // 缩放视窗
      if (this.magicKeys.ctrl.value) {
        const zoomFactor = Math.abs(deltaY) < 10 ? deltaY * 2 : deltaY / 3
        let newZoom = this.getZoom() * (1 - zoomFactor / 200)
        newZoom = clamp(newZoom, 0.01, 20)
        this.zoomToPoint(new Point(offsetX, offsetY), newZoom)
        return
      }
      // 滚动画布
      const deltaPoint = new Point()
      if (this.magicKeys.shift.value) {
        deltaPoint.x = deltaX > 0 ? -20 : 20
      } else {
        deltaPoint.y = deltaY > 0 ? -20 : 20
      }
      this.relativePan(deltaPoint)
    })
  }

  /**
   * 图层位置改变
   */
  override _onStackOrderChanged() {
    super._onStackOrderChanged()
    // 更新objects
    triggerRef(this.objects)
  }

  // @ts-ignore
  override get _activeObject() {
    return this.activeObject.value
  }

  override set _activeObject(value) {
    this.activeObject.value = value
  }

  override add(...objects: FabricObject[]): number {
    const newObjects = objects.map((obj) => toRefObject(obj))
    return super.add(...(newObjects as any[]))
  }
}

export { FabricCanvas }
