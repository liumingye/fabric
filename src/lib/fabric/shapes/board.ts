import { Group, Rect, classRegistry, FabricObject, Text, Point } from '../fabric'
import type { GroupProps } from 'fabric/src/shapes/Group'

export const boardDefaultValues = {
  // padding: 5,
  selectable: false,
  subTargetCheck: true,
  interactive: true,
  layout: 'clip-path',
}

export class Board extends Group {
  private text: Text

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
    // this.lockScalingX = true
    // this.lockScalingY = true

    this.text = new Text('画板', {
      fontSize: 14,
      originX: 'left',
      originY: 'bottom',
    })

    this.on('rotating', this.setClipPath)
    this.on('added', this.setClipPath)
    this.on('modified', () => {
      this.setClipPath()
      this._scaling = false
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
      this._scaling = true
    })

    this.setCoords()
  }

  // getLayoutStrategyResult() {}

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
    const { x, y } = this.aCoords.tl
    this.text
      .set({
        left: x,
        top: y - 2,
        angle: this.angle,
      })
      .render(ctx)
  }

  shouldCache() {
    if (this._scaling) return false
    const ownCache = super.shouldCache()
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
