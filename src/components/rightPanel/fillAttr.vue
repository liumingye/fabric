<script setup lang="ts">
  import Panel from './panel.vue'
  import PanelTitle from './panelTitle.vue'
  import { useActiveObjectModel } from './hooks/useActiveObjectModel'
  import { isString } from 'lodash'
  import { util, Color as FabricColor, Gradient, Pattern } from '@fabric'
  import type { GradientCoords } from 'fabric/src/gradient/typedefs'
  import Modal from '@/components/modal'
  import ColorPicker from '@/components/colorPicker/index.vue'
  import { useEditor } from '@/app'
  import { isDefined } from '@vueuse/core'
  import { ColorPoint, ColorType } from '@/components/colorPicker/interface'
  import {
    gradAngleToCoords,
    validateColor,
    pointsToColorStops,
    fabricGradientToPoints,
  } from '@/utils/fill'

  const fill = useActiveObjectModel('fill')

  const convertCoordsToDeg = (coords: GradientCoords<'linear'>) =>
    (Math.atan2(coords.y2 - coords.y1, coords.x2 - coords.x1) * 180) / Math.PI + 90

  const background = computed(() => {
    const value = fill.value.modelValue
    let css = ''
    if (isString(value)) {
      css += value
    } else if (util.isGradient(value)) {
      if (value.type === 'linear') {
        css += `linear-gradient(${convertCoordsToDeg(value.coords)}deg`
      } else {
        css += `radial-gradient(8px 8px at 8px 8px`
      }
      css += `,${value.colorStops.map((cs) => `${cs.color} ${cs.offset * 100}%`).join(',')})`
    }
    return css || '#fff'
  })

  const fillHexColor = (hex: string) => {
    return hex.padEnd(6, hex)
  }

  const onChange = (value: string) => {
    value = value.replace(/^#/, '')
    if (value.length < 6) {
      value = '#' + fillHexColor(value)
    }
    if (!validateColor(value)) return
    fill.value.onChange(value)
  }

  const modelValue = ref('')
  watchEffect(() => {
    let value = fill.value.modelValue
    if (isString(value)) {
      modelValue.value = new FabricColor(value).toHex().toUpperCase()
      return
    } else if (util.isGradient(value)) {
      modelValue.value = value.type === 'linear' ? '线性渐变' : '径向渐变'
      return
    }
    modelValue.value = '图案填充'
  })

  const readonly = computed(() => !isString(fill.value.modelValue))

  const openColorPicker = () => {
    const { canvas, undoRedo } = useEditor()
    if (!isDefined(canvas.activeObject)) return

    let points: ColorPoint[]
    let type: ColorType = 'color'
    if (canvas.activeObject.value.fill instanceof Gradient<'linear' | 'radial'>) {
      points = fabricGradientToPoints(canvas.activeObject.value.fill)
      type = canvas.activeObject.value.fill.type
    } else if (canvas.activeObject.value.fill instanceof Pattern) {
      //
    } else if (canvas.activeObject.value.fill) {
      const color = new FabricColor(canvas.activeObject.value.fill)
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

    Modal.open({
      title: '颜色',
      content: () =>
        h(
          'div',
          {
            class: '-mx-20px -my-24px',
          },
          h(ColorPicker, {
            gradient: {
              type,
              points,
            },
            onChange(data) {
              if (!isDefined(canvas.activeObject)) return
              if (data.type === 'color') {
                if (data.points.length < 1) return
                const { red, green, blue, alpha } = data.points[0]
                canvas.activeObject.value.set('fill', `rgba(${red}, ${green}, ${blue}, ${alpha})`)
              } else if (data.type === 'linear' || data.type === 'radial') {
                const colorStops = pointsToColorStops(data.points)
                let angle = 0

                let coords: GradientCoords<'linear' | 'radial'> | undefined = undefined

                if (canvas.activeObject.value.fill instanceof Gradient<'linear'>) {
                  coords = canvas.activeObject.value.fill.coords
                  // angle = getAngle(coords)
                }

                if (!coords) {
                  const angleCoords = gradAngleToCoords(angle)
                  coords = {
                    x1: angleCoords.x1 * canvas.activeObject.value.width,
                    y1: angleCoords.y1 * canvas.activeObject.value.height,
                    x2: angleCoords.x2 * canvas.activeObject.value.width,
                    y2: angleCoords.y2 * canvas.activeObject.value.height,
                  }
                }

                canvas.activeObject.value.set(
                  'fill',
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
        ),
      footer: false,
      draggable: true,
      mask: false,
      width: 240,
    })
  }
</script>

<template>
  <Panel>
    <PanelTitle title="填充" />
    <!-- <div>点击 + 重置并修改多个内容</div> -->
    <a-row :gutter="[4, 4]" align="center">
      <a-col :span="10">
        <a-input size="mini" v-model="modelValue" :readonly="readonly" @change="onChange">
          <template #prefix>
            <a-button size="mini" class="icon-btn" @click="openColorPicker">
              <template #icon>
                <div
                  class="w16px h16px rd-4px"
                  :style="{
                    background,
                  }"
                ></div>
              </template>
            </a-button>
          </template>
        </a-input>
      </a-col>
    </a-row>
  </Panel>
</template>

<style scoped lang="less">
  :deep(.arco-input-wrapper) {
    padding-left: 0 !important;
  }

  :deep(.arco-input-prefix) {
    padding-right: 0 !important;
    margin-left: -1px;
    margin-right: 4px;
    justify-content: center;

    .arco-btn {
      width: 32px;
    }
  }
</style>
