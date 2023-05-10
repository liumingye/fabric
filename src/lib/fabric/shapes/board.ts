import { Rect, classRegistry, FabricObject, Text, Point } from '../fabric'
import { Group } from '../group'
import type { GroupProps } from 'fabric/src/shapes/Group'

export const boardDefaultValues = {
  padding: 5,
  selectable: false,
  subTargetCheck: true,
  interactive: true,
  layout: 'clip-path',
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

    this.on('rotating', this.setClipPath)
    this.on('added', this.setClipPath)
    this.on('modified', () => {
      this.setClipPath()
      // this._scaling = false
    })
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
    ctx.fillText('画板', 4, -2)
    ctx.restore()
  }

  shouldCache() {
    const ownCache = FabricObject.prototype.shouldCache.call(this)
    if (ownCache) {
      for (let i = 0; i < this._objects.length; i++) {
        if (this._objects[i].shouldCache()) {
          this.ownCaching = false
          return false
        }
      }
    }
    return ownCache
  }
}

classRegistry.setClass(Board)
classRegistry.setClass(Board, 'board')
