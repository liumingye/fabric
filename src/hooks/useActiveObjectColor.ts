import { isString } from 'lodash'
import { util, TFiller, Color as FabricColor } from '@fabric'
import type { GradientCoords } from 'fabric/src/gradient/typedefs'
import { padHexColor } from '@/utils/fill'
import { appInstance } from '@/app'
import { IFabricCanvas } from '@/core/canvas/fabricCanvas'
import ColorPicker from '@/components/colorPicker'
import { Fn, tryOnScopeDispose } from '@vueuse/core'
import NP from 'number-precision'

/**
 * convertCoordsToDeg
 * @param coords
 */
const convertCoordsToDeg = ({ x1, y1, x2, y2 }: GradientCoords<'linear'>) =>
  (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + 90

export function useColor(
  color: Ref<string | TFiller | null | undefined>,
  option: {
    attr: 'fill' | 'stroke'
    onChange: (value: string | TFiller | null | undefined) => void
  },
) {
  /** 小方块颜色图标 */
  const background = computed(() => {
    let css = ''
    if (isString(color.value)) {
      css += color.value
    } else if (util.isGradient(color.value)) {
      if (color.value.type === 'linear') {
        css += `linear-gradient(${convertCoordsToDeg(color.value.coords)}deg`
      } else {
        css += `radial-gradient(8px 8px at 8px 8px`
      }
      css += `,${color.value.colorStops.map((cs) => `${cs.color} ${cs.offset * 100}%`).join(',')})`
    }
    return css || '#fff'
  })

  /** 透明度 */
  const opacity = ref<number>()
  /** 格式化后的值 */
  const formatValue = ref<string>()
  watch(
    color,
    (value) => {
      if (isString(value)) {
        const fabricColor = new FabricColor(value)
        formatValue.value = fabricColor.toHex().toUpperCase()
        opacity.value = NP.times(fabricColor.getAlpha(), 100)
        return
      } else if (util.isGradient(value)) {
        formatValue.value = value.type === 'linear' ? '线性渐变' : '径向渐变'
        opacity.value = undefined
        return
      } else if (util.isPattern(value)) {
        formatValue.value = '图案填充'
        opacity.value = undefined
        return
      }
      formatValue.value = ''
      opacity.value = undefined
    },
    {
      immediate: true,
    },
  )

  let closeFn: Fn | undefined

  /** 关闭颜色选择器 */
  const closeColorPicker = () => {
    closeFn && closeFn()
  }

  /** 打开颜色选择器 */
  const openColorPicker = () => {
    if (!closeFn) ColorPicker.close()
    appInstance.editor.service.invokeFunction((accessor) => {
      const canvas = accessor.get(IFabricCanvas)
      if (!isDefined(canvas.activeObject)) return
      closeFn = ColorPicker.open({
        object: canvas.activeObject.value,
        attr: option.attr,
        dialogOption: {
          onClose() {
            // 关闭后置空
            closeFn = undefined
          },
        },
      })
    })
  }

  tryOnScopeDispose(() => {
    closeColorPicker()
  })

  return {
    formatValue,
    background,
    opacity,
    openColorPicker,
    closeColorPicker,
    readonly: computed(() => {
      return !isString(color.value)
    }),
    /** 更改透明度 */
    changeOpacity(value: number | undefined) {
      if (!isString(color.value) || !isDefined(value)) return
      const fabricColor = new FabricColor(color.value).setAlpha(NP.divide(value, 100))
      option.onChange(fabricColor.toRgba())
    },
    /** 更改颜色 */
    changeColor(value: string) {
      value = value.replace(/^#/, '')
      if (value.length < 6) {
        value = padHexColor(value)
      }
      const fabricColor = new FabricColor(value).setAlpha(NP.divide(opacity.value || 100, 100))
      option.onChange(fabricColor.toRgba())
    },
  }
}
