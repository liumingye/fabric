import Dialog from '@/components/dialog'
import _ColorPicker from './colorPicker.vue'
import { DialogReturn, DialogConfig } from '@/components/dialog/interface'
import { Color as FabricColor, Gradient, Pattern, FabricObject, GradientCoords } from '@fabric'
import { useEditor } from '@/app'
import { ColorPoint, ColorType } from '@/components/colorPicker/interface'
import { gradAngleToCoords, pointsToColorStops, fabricGradientToPoints } from '@/utils/fill'
import { isDefined } from '@vueuse/core'

let dialog: DialogReturn | undefined

/**
 * 关闭dialog
 */
const dialogClose = () => {
  dialog && dialog.close()
  dialog = undefined
}

const open = (
  object: FabricObject,
  attr: 'fill' | 'stroke',
  dialogOption: Partial<DialogConfig> = {},
) => {
  if (!dialog) {
    const { canvas, undoRedo } = useEditor()

    let points: ColorPoint[]
    let type: ColorType = 'color'

    const colorValue = object[attr]

    if (colorValue instanceof Gradient<'linear' | 'radial'>) {
      points = fabricGradientToPoints(colorValue)
      type = colorValue.type
    } else if (colorValue instanceof Pattern) {
      //
    } else if (colorValue) {
      const color = new FabricColor(colorValue)
      const [red, green, blue, alpha] = color.getSource()
      points = [
        {
          left: 0,
          red,
          green,
          blue,
          alpha,
        },
        {
          left: 100,
          red: 255,
          green: 255,
          blue: 255,
          alpha: 0,
        },
      ]
    }

    dialog = Dialog.open({
      title: '颜色',
      body: () =>
        h(_ColorPicker, {
          gradient: {
            type,
            points,
          },
          onChange(data) {
            if (!isDefined(object)) return
            if (data.type === 'color') {
              if (data.points.length < 1) return
              const [{ red, green, blue, alpha }] = data.points
              object.set(attr, `rgba(${red}, ${green}, ${blue}, ${alpha})`)
            } else if (data.type === 'linear' || data.type === 'radial') {
              const colorStops = pointsToColorStops(data.points)
              const angle = 180

              let coords: GradientCoords<'linear' | 'radial'> | undefined = undefined

              const colorValue = object[attr]

              if (colorValue instanceof Gradient<'linear'>) {
                coords = colorValue.coords
                // angle = getAngle(coords)
              }

              if (!coords) {
                const angleCoords = gradAngleToCoords(angle)
                coords = {
                  x1: angleCoords.x1 * object.width,
                  y1: angleCoords.y1 * object.height,
                  x2: angleCoords.x2 * object.width,
                  y2: angleCoords.y2 * object.height,
                }
              }

              object.set(
                attr,
                new Gradient({
                  type: 'linear',
                  coords,
                  colorStops,
                }),
              )
            }
            canvas.requestRenderAll()
          },
          onEndChange() {
            undoRedo.saveState()
          },
        }),
      width: 240,
      top: window.innerHeight / 2 - 202,
      left: window.innerWidth - 240 - 240,
      ...dialogOption,
      onClose() {
        dialog = undefined
        dialogOption.onClose?.()
      },
    })
  }

  return dialogClose
}

const ColorPicker = Object.assign(_ColorPicker, { open })

export default ColorPicker
