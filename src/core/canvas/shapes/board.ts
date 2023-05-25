import { Rect, classRegistry, FabricObject } from '@fabric'
import type { GroupProps } from 'fabric/src/shapes/Group'
import { Group as GroupOrigin } from 'fabric'
import { toRefObject } from '@/core/canvas/toRefObject'

export const boardDefaultValues = {
  padding: 5,
  selectable: false,
  layout: 'fixed',
}

export class Board extends GroupOrigin {
  public subTargetCheck = true
  public interactive = true

  static ownDefaults: Record<string, any> = boardDefaultValues

  static getDefaults(): Record<string, any> {
    return {
      ...super.getDefaults(),
      ...Board.ownDefaults,
    }
  }

  constructor(
    objects?: FabricObject[],
    options?: Partial<GroupProps>,
    objectsRelativeToGroup?: boolean,
  ) {
    const newObjects = objects?.map((obj) => toRefObject(obj))

    super(newObjects, options, objectsRelativeToGroup)

    this.on('scaling', () => {
      const { y: height, x: width } = this._getTransformedDimensions()
      this.set({
        width,
        height,
        scaleX: 1,
        scaleY: 1,
      })
      this.setClipPath()
    })

    this.on('added', () => {
      this.setClipPath()
      this.updateSelectable()
      watchEffect(() => {
        // 锁定selectable
        if (this.ref.selectable && this.size()) {
          this.ref.selectable = false
        }
      })
    })
  }

  private updateSelectable() {
    // 画板内没有元素开启selectable，否则关闭
    if (this.ref) {
      this.ref.selectable = !this.size()
    }
  }

  private setClipPath() {
    this.clipPath = new Rect({
      top: 0,
      left: 0,
      width: this.width,
      height: this.height,
      originX: 'center',
      originY: 'center',
    })
  }

  override setCoords() {
    super.setCoords()
    this.clipPath && this.clipPath.setCoords()
  }

  override _renderBackground(ctx: CanvasRenderingContext2D) {
    Rect.prototype._render.call(this, ctx)
  }

  override render(ctx: CanvasRenderingContext2D) {
    super.render(ctx)

    if (this.visible) {
      // 左上角文字
      ctx.save()
      this.transform(ctx)
      ctx.translate(-this.width / 2, -this.height / 2)
      ctx.scale(1 / (this.zoomX ?? 1), 1 / (this.zoomY ?? 1))
      ctx.font = '12px Helvetica'
      ctx.fillStyle = '#888'
      ctx.textBaseline = 'bottom'
      ctx.fillText(this.name, 0, -2)
      ctx.restore()
    }
  }

  override _watchObject(_watch: boolean, _object: FabricObject) {
    // noop
  }

  override _onObjectAdded(object: FabricObject) {
    super._onObjectAdded(object)
    this.updateSelectable()
  }

  override _onObjectRemoved(object: FabricObject) {
    super._onObjectAdded(object)
    this.updateSelectable()
  }

  override toObject(propertiesToInclude: any[] = []): any {
    const res = super.toObject(propertiesToInclude)
    // 移除clipPath
    delete res.clipPath
    return res
  }
}

classRegistry.setClass(Board)
