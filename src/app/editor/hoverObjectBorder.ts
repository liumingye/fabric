import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { FabricObject, util, CanvasEvents, Rect, Textbox } from '@fabric'
import { clone } from 'lodash'
import { Disposable } from '@/utils/lifecycle'

/**
 * 对象获得焦点后在外围显示一个边框
 */
export class HoverObjectBorder extends Disposable {
  private lineWidth = 3

  constructor(@IFabricCanvas private readonly canvas: FabricCanvas) {
    super()
    canvas.on('mouse:out', this.drawBorder.bind(this))
    canvas.on('mouse:over', this.clearBorder.bind(this))
  }

  private clearContextTop(target: FabricObject, restoreManually = false) {
    const ctx = this.canvas.contextTop
    const vpt = this.canvas.viewportTransform
    ctx.save()
    ctx.transform(vpt[0], vpt[1], vpt[2], vpt[3], vpt[4], vpt[5])
    target.transform(ctx)
    const { strokeWidth, scaleX, scaleY, strokeUniform } = target
    // we add 4 pixel, to be sure to do not leave any pixel out
    const width = target.width + 4 + (strokeUniform ? strokeWidth / scaleX : strokeWidth)
    const height = target.height + 4 + (strokeUniform ? strokeWidth / scaleY : strokeWidth)
    ctx.clearRect(-width / 2, -height / 2, width, height)
    restoreManually || ctx.restore()
    return ctx
  }

  private clearBorder(e: CanvasEvents['mouse:over']) {
    if (!e.target) return
    if (this.canvas.contextTopDirty) {
      this.clearContextTop(e.target)
    }
  }

  private drawBorder(e: CanvasEvents['mouse:out']) {
    if (!e.target) return
    const target = e.target

    if (util.isBoard(target) || target === this.canvas._activeObject) return

    const ctx = this.clearContextTop(target, true)
    if (!ctx) return
    // ctx.save()

    const object = clone(target)

    // 文字特殊处理，显示下划线
    if (object instanceof Textbox) {
      object.underline = true
      object.fill = 'rgb(60,126,255)'
      object._renderTextDecoration(ctx, 'underline')
      object._drawClipPath(ctx, object.clipPath)
      ctx.restore()
      this.canvas.contextTopDirty = true
      return
    }

    // 分组特殊处理，显示矩形边框
    if (util.isCollection(object)) {
      object._render = Rect.prototype._render
    }

    const { strokeWidth, strokeUniform } = object

    let { width, height } = object

    width += strokeUniform ? strokeWidth / object.scaleX : strokeWidth
    height += strokeUniform ? strokeWidth / object.scaleY : strokeWidth

    const totalObjectScaling = object.getTotalObjectScaling()

    const lineWidth = Math.min(
      this.lineWidth,
      width * totalObjectScaling.x,
      height * totalObjectScaling.y,
    )

    width -= lineWidth / totalObjectScaling.x
    height -= lineWidth / totalObjectScaling.y

    object.set({
      width,
      height,
      stroke: 'rgb(60,126,255)',
      strokeWidth: lineWidth,
      strokeDashArray: null,
      strokeDashOffset: 0,
      strokeLineCap: 'butt',
      strokeLineJoin: 'miter',
      strokeMiterLimit: 4,
    })

    object._renderPaintInOrder = () => {
      ctx.save()
      const scaling = object.getTotalObjectScaling()
      ctx.scale(1 / scaling.x, 1 / scaling.y)
      object._setLineDash(ctx, object.strokeDashArray)
      object._setStrokeStyles(ctx, object)
      ctx.stroke()
      ctx.restore()
    }

    object._render(ctx)

    ctx.restore()
    this.canvas.contextTopDirty = true
  }
}
