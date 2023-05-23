import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IKeybindingService, KeybindingService } from '@/core/keybinding/keybindingService'
import { Disposable } from '@/utils/lifecycle'
import { EventbusService, IEventbusService } from '@/core/eventbus/eventbusService'
import { useFabricEvent } from '@/hooks/useFabricEvent'
import { Color } from '@fabric'

/**
 * 配置
 */
export interface RulerOptions {
  /**
   * 标尺宽高
   * @default 20
   */
  ruleSize?: number

  /**
   * 字体大小
   * @default 10
   */
  fontSize?: number

  /**
   * 是否开启标尺
   * @default false
   */
  enabled?: boolean

  /**
   * 背景颜色
   */
  backgroundColor?: string

  /**
   * 文字颜色
   */
  textColor?: string

  /**
   * 边框颜色
   */
  borderColor?: string

  /**
   * 高亮颜色
   */
  highlightColor?: string
}

export class Ruler extends Disposable {
  /**
   * 配置
   */
  public options: Required<RulerOptions>

  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService private readonly keybindingService: KeybindingService,
    @IEventbusService private readonly eventbusService: EventbusService,
  ) {
    super()

    // 合并默认配置
    this.options = Object.assign({
      ruleSize: 24,
      fontSize: 10,
      enabled: false,
      backgroundColor: '#242424',
      borderColor: '#555',
      highlightColor: '#007fff',
      textColor: '#ddd',
    })

    useFabricEvent({
      'after:render': this.render.bind(this),
    })
  }

  /**
   * 获取画板尺寸
   */
  private getSize() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    }
  }

  private render({ ctx }: { ctx: CanvasRenderingContext2D }) {
    const vpt = this.canvas.viewportTransform
    if (!vpt) return
    // 绘制尺子
    this.draw({
      ctx,
      isHorizontal: true,
      rulerLength: this.getSize().width,
      startCalibration: -(vpt[4] / vpt[0]),
    })
    this.draw({
      ctx,
      isHorizontal: false,
      rulerLength: this.getSize().height,
      startCalibration: -(vpt[5] / vpt[3]),
    })
  }

  private draw(opt: {
    ctx: CanvasRenderingContext2D
    isHorizontal: boolean
    rulerLength: number
    startCalibration: number
  }) {
    const { ctx, isHorizontal, rulerLength, startCalibration } = opt
    const zoom = this.canvas.getZoom()

    const gap = this.getGap(zoom)
    const unitLength = rulerLength / zoom
    const startValue = Math.floor(startCalibration / gap) * gap
    const startOffset = startValue - startCalibration

    const canvasSize = this.getSize()

    const { textColor, borderColor, ruleSize } = this.options

    this.darwRect(ctx, {
      left: 0,
      top: 0,
      width: isHorizontal ? canvasSize.width : ruleSize,
      height: isHorizontal ? ruleSize : canvasSize.height,
      fill: this.options.backgroundColor,
      stroke: this.options.borderColor,
    })

    // 标尺文字显示
    for (let pos = 0; pos + startOffset <= Math.ceil(unitLength); pos += gap) {
      const position = (startOffset + pos) * zoom
      const textValue = (startValue + pos).toString()
      this.darwText(ctx, {
        text: textValue,
        left: isHorizontal ? position + 6 : 2.5,
        top: isHorizontal ? 2.5 : position - 6,
        fill: textColor,
        angle: isHorizontal ? 0 : -90,
      })
    }

    // 标尺刻度线显示
    for (let pos = 0; pos + startOffset <= Math.ceil(unitLength); pos += gap) {
      for (let index = 0; index < 10; index++) {
        const position = Math.round((startOffset + pos + (gap * index) / 10) * zoom)
        const isMajorLine = index === 0
        const [left, top] = isHorizontal
          ? [position, isMajorLine ? 0 : ruleSize - 8]
          : [isMajorLine ? 0 : ruleSize - 8, position]
        const [width, height] = isHorizontal ? [0, ruleSize - top] : [ruleSize - left, 0]
        this.darwLine(ctx, {
          left,
          top,
          width,
          height,
          stroke: borderColor,
        })
      }
    }
  }

  private getGap(zoom: number) {
    const zooms = [0.02, 0.03, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
    const gaps = [5000, 2500, 1000, 500, 200, 100, 50, 20, 10]

    let i = 0
    while (i < zooms.length && zooms[i] < zoom) {
      i++
    }

    return gaps[i - 1] || 10000
  }

  private darwRect(
    ctx: CanvasRenderingContext2D,
    options: {
      left: number
      top: number
      width: number
      height: number
      fill?: string | CanvasGradient | CanvasPattern
      stroke?: string
      strokeWidth?: number
    },
  ) {
    ctx.save()
    const { left, top, width, height, fill, stroke, strokeWidth } = options
    ctx.beginPath()
    fill && (ctx.fillStyle = fill)
    ctx.rect(left, top, width, height)
    ctx.fill()
    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = strokeWidth ?? 1
      ctx.stroke()
    }
    ctx.restore()
  }

  private darwText(
    ctx: CanvasRenderingContext2D,
    options: {
      left: number
      top: number
      text: string
      fill?: string | CanvasGradient | CanvasPattern
      // eslint-disable-next-line no-undef
      align?: CanvasTextAlign
      angle?: number
      fontSize?: number
    },
  ) {
    ctx.save()
    const { left, top, text, fill, align, angle, fontSize } = options
    fill && (ctx.fillStyle = fill)
    ctx.textAlign = align ?? 'left'
    ctx.textBaseline = 'top'
    ctx.font = `${fontSize ?? 10}px sans-serif`
    if (angle) {
      ctx.translate(left, top)
      ctx.rotate((Math.PI / 180) * angle)
      ctx.translate(-left, -top)
    }
    ctx.fillText(text, left, top)
    ctx.restore()
  }

  private darwLine(
    ctx: CanvasRenderingContext2D,
    options: {
      left: number
      top: number
      width: number
      height: number
      stroke?: string | CanvasGradient | CanvasPattern
      lineWidth?: number
    },
  ) {
    ctx.save()
    const { left, top, width, height, stroke, lineWidth } = options
    ctx.beginPath()
    stroke && (ctx.strokeStyle = stroke)
    ctx.lineWidth = lineWidth ?? 1
    ctx.moveTo(left, top)
    ctx.lineTo(left + width, top + height)
    ctx.stroke()
    ctx.restore()
  }
}
