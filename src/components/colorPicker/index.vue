<template>
  <div class="ui-color-picker">
    <Gradient
      :mode="mode"
      :points="gradient.points"
      :type="gradient.type"
      :on-change="onChange"
      :on-start-change="onStartChange"
      :on-end-change="onEndChange"
    />
  </div>
</template>

<script lang="ts" setup>
  import Gradient from './Gradient/index.vue'
  import { ColorPoint, Mode, ColorType } from '@/components/colorPicker/interface'
  import { noop } from '@vueuse/core'

  withDefaults(
    defineProps<{
      mode?: Mode
      gradient: {
        type: ColorType
        points: ColorPoint[]
      }
      onChange?: (data: { points: ColorPoint[]; type: ColorType }) => void
      onStartChange?: (data: { points: ColorPoint[]; type: ColorType }) => void
      onEndChange?: (data: { points: ColorPoint[]; type: ColorType }) => void
    }>(),
    {
      mode: 'hex',
      gradient: () => ({
        type: 'color',
        points: [
          {
            left: 0,
            red: 255,
            green: 0,
            blue: 0,
            alpha: 1,
          },
          {
            left: 100,
            red: 255,
            green: 255,
            blue: 255,
            alpha: 0,
          },
        ],
      }),
      onChange: noop,
      onStartChange: noop,
      onEndChange: noop,
    },
  )
</script>

<style lang="less">
  @import './index.less';
</style>
