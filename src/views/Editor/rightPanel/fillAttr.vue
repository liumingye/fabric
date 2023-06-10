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

  const { canvas } = useEditor()

  let closeFn: Fn | undefined

  /**
   * 关闭dialog
   */
  const closeColorPicker = () => {
    closeFn && closeFn()
    closeFn = undefined
  }

  const fill = useActiveObjectModel('fill')

  /**
   * convertCoordsToDeg
   * @param coords
   */
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

  const fillChange = (value: string) => {
    value = value.replace(/^#/, '')
    if (value.length < 6) {
      value = padHexColor(value)
    }
    const color = new Color(value)
    fill.value.onChange(`#${color.toHex()}`)
  }

  const fillValue = ref('')
  watchEffect(() => {
    let value = fill.value.modelValue
    if (isString(value)) {
      fillValue.value = new FabricColor(value).toHex().toUpperCase()
      return
    } else if (util.isGradient(value)) {
      fillValue.value = value.type === 'linear' ? '线性渐变' : '径向渐变'
      return
    } else if (util.isPattern(value)) {
      fillValue.value = '图案填充'
      return
    }
    fillValue.value = ''
  })

  watch(canvas.activeObject, () => closeColorPicker())

  const readonly = computed(() => !isString(fill.value.modelValue))

  const openColorPicker = () => {
    const { canvas } = useEditor()
    if (!isDefined(canvas.activeObject)) return
    closeFn = ColorPicker.open({
      object: canvas.activeObject.value,
      attr: 'fill',
    })
  }

  onUnmounted(() => {
    closeColorPicker()
  })
</script>

<template>
  <Panel title="填充" :disable-add="!!fill.modelValue" @click-add="fill.onChange('#cccccc')">
    <!-- <div>点击 + 重置并修改多个内容</div> -->
    <a-row :gutter="[4, 4]" align="center">
      <a-col :span="10">
        <a-input size="mini" v-model="fillValue" :readonly="readonly" @change="fillChange">
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
      <a-col :span="3.5" class="mlauto">
        <a-button size="small" class="icon-btn" @click="fill.onChange(null)">
          <template #icon>
            <icon-minus />
          </template>
        </a-button>
      </a-col>
    </a-row>
  </Panel>
</template>

<style scoped lang="less">
  :deep(.arco-input-wrapper) {
    padding-left: 0 !important;
  }
</style>
