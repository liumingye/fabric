import { Canvas, Object as FabricObject, util } from '@/lib/fabric'
import { randomText } from '@/utils/strings'
import { createDecorator } from '@/core/instantiation/instantiation'
import { toRefObject } from '@/core/canvas/toRefObject'

export const IFabricCanvas = createDecorator<IFabricCanvas>('fabricCanvas')

export interface IFabricCanvas extends FabricCanvas {
  readonly _serviceBrand: undefined
}

export class FabricCanvas extends Canvas {
  declare readonly _serviceBrand: undefined

  public activeObject = shallowRef<FabricObject>()
  public computed = {
    objects: computed(() => this._objects),
  }

  // public objectsRef = computed(() => this._objects)
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
          // preserveObjectStacking: true,
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
      // this.ref.objects = this._objects
      triggerRef(this.computed.objects)
    }

    this.on({
      'object:added': objectAdded,
      'object:removed': () => triggerRef(this.computed.objects),
    })

    // @ts-ignore
    this._activeSelection = toRefObject(this._activeSelection)
  }

  /**
   * 图层位置改变
   */
  override _onStackOrderChanged() {
    super._onStackOrderChanged()
    // 更新objects
    triggerRef(this.computed.objects)
    // this.ref.objects = this._objects
  }

  // @ts-ignore
  override get _activeObject() {
    return this.activeObject.value
  }

  override set _activeObject(value) {
    this.activeObject.value = value
  }

  override add(...objects: FabricObject[]): number {
    return super.add(...objects.map((obj) => toRefObject(obj)))
  }

  override _onObjectAdded(obj: FabricObject) {
    if (!obj.get('noEventObjectAdded')) {
      super._onObjectAdded(obj)
    } else {
      obj._set('canvas', this)
    }
  }
}
