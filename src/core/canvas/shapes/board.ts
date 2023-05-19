import { Rect, classRegistry, FabricObject } from '@/lib/fabric/fabric'
import { Group } from './group'
import type { GroupProps } from 'fabric/src/shapes/Group'

export const boardDefaultValues = {
  padding: 5,
  selectable: false,
  subTargetCheck: true,
  interactive: true,
  layout: 'fixed',
}

export class Board extends Group {
  static ownDefaults: Record<string, any> = boardDefaultValues

  static getDefaults(): Record<string, any> {
    return {
      ...super.getDefaults(),
      ...Board.ownDefaults,
    }
  }

  constructor(
    objects: FabricObject[] = [],
    options: Partial<GroupProps> = {},
    objectsRelativeToGroup?: boolean,
  ) {
    super(objects, options as any, objectsRelativeToGroup)
    // this.setRelativeX
    // this.lockScalingY = true

    // this.on('rotating', this.setClipPath)
    this.setClipPath()
    // this.on('modified', () => {
    //   this.setClipPath()
    //   // this._scaling = false
    // })
    this.on('scaling', () => {
      this.set({
        width: this.getScaledWidth(),
        height: this.getScaledHeight(),
      })
      this.set({
        scaleX: 1,
        scaleY: 1,
      })
      this.setClipPath()
      // this._scaling = true
    })

    this.setCoords()

    this.on('added', () => {
      this.updateSelectable()
      watchEffect(() => {
        // 锁定selectable
        if (this.ref.selectable && this.size()) {
          this.ref.selectable = false
        }
      })
    })
  }

  updateSelectable() {
    // 画板内没有元素开启selectable，否则关闭
    if (this.ref) {
      this.ref.selectable = !this.size()
    }
  }

  setClipPath() {
    this.clipPath = new Rect({
      top: 0,
      left: 0,
      width: this.width,
      height: this.height,
      originX: 'center',
      originY: 'center',
    })
  }

  setCoords() {
    super.setCoords()
    this.clipPath && this.clipPath.setCoords()
  }

  render(ctx: CanvasRenderingContext2D) {
    super.render(ctx)

    if (this.visible) {
      // 左上角文字
      const { x, y } = this.oCoords.tl
      const retinaScaling = this.getCanvasRetinaScaling()
      const angle = this.getTotalAngle()
      ctx.save()
      ctx.setTransform(retinaScaling, 0, 0, retinaScaling, 0, 0)
      ctx.translate(x, y)
      ctx.rotate((angle * Math.PI) / 180)
      ctx.font = '12px Helvetica'
      ctx.fillStyle = '#888'
      ctx.textBaseline = 'bottom'
      ctx.fillText(this.name, 4, -2)
      ctx.restore()
    }
  }

  _watchObject(_watch: boolean, _object: FabricObject) {
    // noop
  }

  _onObjectAdded(object: FabricObject) {
    super._onObjectAdded(object)
    this.updateSelectable()
  }

  _onObjectRemoved(object: FabricObject) {
    super._onObjectAdded(object)
    this.updateSelectable()
  }
}

classRegistry.setClass(Board)
classRegistry.setClass(Board, 'board')
