import type { ColorPoint } from '@/components/colorPicker/interface'
import { Color, Gradient } from '@fabric'
// import type { GradientCoords } from 'fabric/src/gradient/typedefs'

/**
 * 根据坐标计算角度
 * @param coords 坐标 { x1, y1, x2, y2 }
 * @returns 角度值
 */
// export const getAngle = ({ x1, y1, x2, y2 }: GradientCoords<'linear' | 'radial'>) => {
//   // if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return
//   const dx = x2 - x1
//   const dy = y2 - y1
//   const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
//   return angle >= 0 ? angle : angle + 360
// }

// 角度转换坐标
export const gradAngleToCoords = (paramsAngle: number) => {
  const anglePI = -parseInt(paramsAngle + '', 10) * (Math.PI / 180)
  const angleCoords = {
    x1: Math.round(50 + Math.sin(anglePI) * 50) / 100,
    y1: Math.round(50 + Math.cos(anglePI) * 50) / 100,
    x2: Math.round(50 + Math.sin(anglePI + Math.PI) * 50) / 100,
    y2: Math.round(50 + Math.cos(anglePI + Math.PI) * 50) / 100,
  }
  return angleCoords
}

const reRGBa =
  /^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)\s*,\s*(\d{1,3}(?:\.\d+)?%?)\s*,\s*(\d{1,3}(?:\.\d+)?%?)\s*(?:\s*,\s*((?:\d*\.?\d+)?)\s*)?\)$/i
const reHSLa =
  /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3}%)\s*,\s*(\d{1,3}%)\s*(?:\s*,\s*(\d+(?:\.\d+)?)\s*)?\)$/i
const reHex = /^#?([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})$/i

export const validateColor = (color: string) => {
  return reRGBa.test(color) || reHSLa.test(color) || reHex.test(color)
}

export const pointsToColorStops = (points: ColorPoint[]) => {
  return points.map((item) => ({
    offset: item.left / 100,
    color: `rgba(${item.red}, ${item.green}, ${item.blue}, ${item.alpha})`,
  }))
}

export const fabricGradientToPoints = (val: Gradient<'linear' | 'radial'>): ColorPoint[] => {
  return val.colorStops.map((item) => {
    const _color = new Color(item.color)
    const [red, green, blue, alpha] = _color.getSource()
    return {
      left: item.offset * 100,
      red,
      green,
      blue,
      alpha,
    }
  })
}