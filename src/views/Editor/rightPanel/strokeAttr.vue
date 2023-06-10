<script setup lang="ts">
  import Panel from './panel.vue'
  import { useActiveObjectModel } from '@/hooks/useActiveObjectModel'
  import { isString } from 'lodash'
  import { util, Color as FabricColor, Color } from '@fabric'
  import type { GradientCoords } from 'fabric/src/gradient/typedefs'
  import ColorPicker from '@/components/colorPicker'
  import { useEditor } from '@/app'
  import { Fn, isDefined } from '@vueuse/core'
  import { padHexColor } from '@/utils/fill'
  import SwipeNumber from '@/components/swipeNumber'
  import type { SelectProps } from '@arco-design/web-vue/es/select'

  const { canvas } = useEditor()

  let closeFn: Fn | undefined

  /**
   * 关闭dialog
   */
  const closeColorPicker = () => {
    closeFn && closeFn()
    closeFn = undefined
  }

  const stroke = useActiveObjectModel('stroke')
  const strokeWidth = useActiveObjectModel('strokeWidth')
  const paintFirst = useActiveObjectModel<'paintFirst', SelectProps['modelValue']>('paintFirst')

  /**
   * convertCoordsToDeg
   * @param coords
   */
  const convertCoordsToDeg = (coords: GradientCoords<'linear'>) =>
    (Math.atan2(coords.y2 - coords.y1, coords.x2 - coords.x1) * 180) / Math.PI + 90

  const background = computed(() => {
    const value = stroke.value.modelValue
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

  const strokeChange = (value: string) => {
    value = value.replace(/^#/, '')
    if (value.length < 6) {
      value = padHexColor(value)
    }
    const color = new Color(value)
    stroke.value.onChange(`#${color.toHex()}`)
  }

  const strokeValue = ref('')
  watchEffect(() => {
    let value = stroke.value.modelValue
    if (isString(value)) {
      strokeValue.value = new FabricColor(value).toHex().toUpperCase()
      return
    } else if (util.isGradient(value)) {
      strokeValue.value = value.type === 'linear' ? '线性渐变' : '径向渐变'
      return
    } else if (util.isPattern(value)) {
      strokeValue.value = '图案填充'
      return
    }
    strokeValue.value = ''
  })

  watch(canvas.activeObject, () => closeColorPicker())

  const readonly = computed(() => !isString(stroke.value.modelValue))

  const openColorPicker = () => {
    const { canvas } = useEditor()
    if (!isDefined(canvas.activeObject) || closeFn) return
    closeFn = ColorPicker.open({
      object: canvas.activeObject.value,
      attr: 'stroke',
    })
  }

  const options = reactive([
    {
      value: 'fill',
      label: '内部',
    },
    {
      value: 'stroke',
      label: '外部',
    },
  ])

  onUnmounted(() => {
    closeColorPicker()
  })
</script>

<template>
  <Panel
    title="边框"
    :disable-add="!!strokeWidth.modelValue"
    @click-add="
      () => {
        if (stroke.modelValue === null) {
          stroke.onChange('#979797')
        }
        strokeWidth.onChange(1)
      }
    "
  >
    <a-row :gutter="[4, 4]" align="center">
      <a-col :span="10">
        <a-input size="mini" v-model="strokeValue" :readonly="readonly" @change="strokeChange">
          <template #prefix>
            <a-button size="mini" class="icon-btn" @click="openColorPicker">
              <template #icon>
                <div
                  class="w18px h18px rd-4px"
                  :style="{
                    background,
                  }"
                ></div>
              </template>
            </a-button>
          </template>
        </a-input>
      </a-col>
      <a-col :span="10">
        <SwipeNumber size="small" :min="1" label="W" v-bind="strokeWidth" :hide-button="false" />
      </a-col>
      <a-col :span="3.5" class="mlauto">
        <a-button size="small" class="icon-btn" @click="strokeWidth.onChange(0)">
          <template #icon>
            <icon-minus />
          </template>
        </a-button>
      </a-col>
      <a-col :span="10">
        <a-select size="small" v-bind="paintFirst" :options="options" />
      </a-col>
    </a-row>
  </Panel>
</template>

<style scoped lang="less">
  :deep(.arco-input-wrapper) {
    padding-left: 0 !important;
  }
</style>
