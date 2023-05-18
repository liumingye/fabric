<template>
  <a-row :wrap="false" :gutter="4">
    <a-col :span="13">
      <a-input size="small" v-model="hex" @change="changeHex" />
    </a-col>
    <a-col :span="11">
      <a-inputNumber
        size="small"
        v-model="alpha"
        hide-button
        :min="0"
        :max="100"
        @change="changeAlpha"
      >
        <template #suffix>%</template>
      </a-inputNumber>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
  import { UpdateColor } from '@/components/colorPicker/interface'
  import { Color, RGBA } from '@/utils/color'
  import { toFixed } from '@/utils/math'
  import { isDefined } from '@vueuse/core'

  const props = defineProps<{
    red: number
    green: number
    blue: number
    alpha: number
    updateColor: UpdateColor
  }>()

  const { red, green, blue } = toRefs(props)

  const hex = ref()
  const alpha = ref()

  watchEffect(() => {
    const color = new Color(new RGBA(red.value, green.value, blue.value))
    hex.value = Color.Format.CSS.formatHex(color).replace('#', '').toLocaleUpperCase()
    alpha.value = toFixed(props.alpha * 100)
  })

  const changeHex = (hex: string) => {
    const color = Color.fromHex(`#${hex.replace('#', '')}`)
    const { h: hue, s: saturation, v: value } = color.hsva
    props.updateColor({
      ...color.rgba,
      hue,
      saturation,
      value,
    })
  }

  const changeAlpha = (alpha: number | undefined) => {
    if (!isDefined(alpha)) return
    props.updateColor({
      a: alpha / 100,
    })
  }
</script>
