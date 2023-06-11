import Dialog from '@/components/dialog'
import _ColorPicker from './colorPicker.vue'
import { DialogReturn } from '@/components/dialog/interface'
import { Color as FabricColor, Gradient, Pattern, GradientCoords } from '@fabric'
import { appInstance } from '@/app'
import { ColorPoint, ColorType } from '@/components/colorPicker/interface'
import { gradAngleToCoords, pointsToColorStops, fabricGradientToPoints } from '@/utils/fill'
import { isDefined } from '@vueuse/core'
import { IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IUndoRedoService } from '@/app/editor/undoRedo/undoRedoService'
import { ServicesAccessor } from '@/core/instantiation/instantiation'
import { ColorPickerOption, Props } from './interface'

let dialog: DialogReturn | undefined

/**
 * 关闭dialog
 */
const dialogClose = () => {
  dialog && dialog.close()
  dialog = undefined
}

const openDialog = (
  accessor: ServicesAccessor,
  { object, attr, dialogOption, initialColor, ...props }: ColorPickerOption & Partial<Props>,
) => {
  const canvas = accessor.get(IFabricCanvas)
  const undoRedo = accessor.get(IUndoRedoService)

  let points: ColorPoint[]
  let type: ColorType = 'color'

  const colorValue = object && attr ? object[attr] : initialColor

  if (colorValue instanceof Gradient) {
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

  return Dialog.open({
    width: 240,
    top: window.innerHeight / 2 - 202,
    left: window.innerWidth - 240 - 240,
    title: '颜色',
    ...dialogOption,
    body: () =>
      h(_ColorPicker, {
        onChange(data) {
          if (!isDefined(object) || !isDefined(attr)) return
          if (data.type === 'color') {
            if (data.points.length < 1) return
            const [{ red, green, blue, alpha }] = data.points
            object.set(attr, `rgba(${red}, ${green}, ${blue}, ${alpha})`)
          } else if (data.type === 'linear' || data.type === 'radial') {
            const colorStops = pointsToColorStops(data.points)
            const angle = 180

            let coords: GradientCoords<'linear' | 'radial'> | undefined = undefined

            const colorValue = object[attr]

            if (colorValue instanceof Gradient) {
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
        ...props,
        gradient: {
          type,
          points,
        },
      }),
    onClose() {
      dialog = undefined
      dialogOption?.onClose?.()
    },
  })
}

const open = (option: ColorPickerOption & Partial<Props>) => {
  if (!dialog) {
    dialog = appInstance.editor.service.invokeFunction(openDialog, option)
  }
  return dialogClose
}

const ColorPicker = Object.assign(_ColorPicker, { open, close: dialogClose })

export default ColorPicker
