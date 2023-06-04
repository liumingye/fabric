import type { FabricObject } from '@fabric'
import type { DialogConfig } from '@/components/dialog/interface'

export interface ColorPoint {
  left: number
  red: number
  green: number
  blue: number
  alpha: number
}

export type Mode = 'hex' | 'rgb' | 'hsb' | 'hsl'

export type ActionName = 'onStartChange' | 'onChange' | 'onEndChange'

export type ColorType = 'color' | 'linear' | 'radial'

export type UpdateColor = (
  color: {
    r?: number
    g?: number
    b?: number
    a?: number
    hue?: number
    saturation?: number
    value?: number
  },
  actionName?: ActionName,
) => void

export interface ColorPickerOption {
  object: FabricObject
  attr: 'fill' | 'stroke'
  dialogOption?: Partial<DialogConfig>
}
