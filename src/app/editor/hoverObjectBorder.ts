import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { FabricObject, util, CanvasEvents, Rect } from '@fabric'
import { cloneDeep } from 'lodash'
import { Disposable } from '@/utils/lifecycle'

/**
 * 对象获得焦点后在外围显示一个边框
 */
export class HoverObjectBorder extends Disposable {
  private lineWidth = 2

  constructor(@IFabricCanvas private readonly canvas: FabricCanvas) {
    super()
    canvas.on('mouse:out', this.drawBorder.bind(this))
    canvas.on('mouse:over', this.clearBorder.bind(this))
  }

  private clearContextTop(target: FabricObject, restoreManually = false) {
    const ctx = this.canvas.contextTop
    if (!ctx) {
      return
    }
    const vpt = this.canvas.viewportTransform
    ctx.save()
    ctx.transform(vpt[0], vpt[1], vpt[2], vpt[3], vpt[4], vpt[5])
    target.transform(ctx)
    // we add 4 pixel, to be sure to do not leave any pixel out
    const width = target.width + 4 + target.strokeWidth,
      height = target.height + 4 + target.strokeWidth
    ctx.clearRect(-width / 2, -height / 2, width, height)
    restoreManually || ctx.restore()
    return ctx
  }

  private clearBorder(e: CanvasEvents['mouse:over']) {
    if (!e.target) return
    if (this.canvas.contextTopDirty) {
      this.clearContextTop(e.target)
    }
    // this.canvas.contextTopDirty = true
  }

  private drawBorder(e: CanvasEvents['mouse:out']) {
    if (!e.target) return
    const target = e.target

    if (util.isBoard(target) || target === this.canvas._activeObject) return

    const ctx = this.clearContextTop(target, true)
    if (!ctx) return
    // ctx.save()

    const object = cloneDeep(target)

    if (util.isCollection(object)) {
      object._render = Rect.prototype._render
    }

    const { width, height, strokeWidth, scaleX, scaleY, strokeUniform } = object

    object.set({
      width: width + strokeWidth / (strokeUniform ? scaleX * (object.group?.scaleX ?? 1) : 1),
      height: height + strokeWidth / (strokeUniform ? scaleY * (object.group?.scaleY ?? 1) : 1),
      stroke: this.canvas.selectionBorderColor,
      strokeWidth: this.lineWidth,
      strokeDashArray: null,
      strokeDashOffset: 0,
      strokeLineCap: 'butt',
      strokeLineJoin: 'miter',
      strokeMiterLimit: 4,
      strokeUniform: true,
    })

    object._renderPaintInOrder = () => {
      object._renderStroke(ctx)
    }

    object._render(ctx)

    ctx.restore()
    this.canvas.contextTopDirty = true
  }
}
