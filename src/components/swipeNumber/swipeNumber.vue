<script setup lang="ts">
  import { usePointerSwipe, useVModel, isDefined } from '@vueuse/core'
  import { isNumber } from 'lodash'

  const props = withDefaults(
    defineProps<{
      label?: string
      modelValue?: number
      modelEvent?: 'change' | 'input'
      step?: number
      max?: number
      min?: number
    }>(),
    {
      modelEvent: 'change',
      step: 1,
    },
  )

  const emit = defineEmits<{
    (e: 'update:modelValue', value: number | undefined): void
    (e: 'change' | 'input', value: number | undefined, ev: Event): void
  }>()

  const numberValue = useVModel(props, 'modelValue', emit)

  // Swipe
  const labelRef = ref<HTMLElement>()
  const startValue = ref<number>()
  const { posStart, posEnd } = usePointerSwipe(labelRef, {
    threshold: 0,
    onSwipeStart: () => {
      startValue.value = numberValue.value
    },
    onSwipe: (e: PointerEvent) => {
      if (!isNumber(startValue.value)) return
      let value = startValue.value + Math.round(posEnd.x - posStart.x) * props.step
      if (isDefined(props.min) && value < props.min) value = props.min
      if (isDefined(props.max) && value > props.max) value = props.max
      numberValue.value = value
      emit(props.modelEvent, numberValue.value, e)
    },
  })
</script>

<template>
  <a-input-number
    v-model="numberValue"
    :modelEvent="modelEvent"
    :step="step"
    :max="max"
    :min="min"
    :hide-button="!!label"
    :class="{
      hasLabel: label,
    }"
  >
    <template #prefix v-if="label">
      <div ref="labelRef" class="w-7.5 text-center cursor-ew-resize">{{ label }}</div>
    </template>
  </a-input-number>
</template>

<style scoped lang="less">
  .arco-input-wrapper.hasLabel {
    padding-left: 0;
    :deep(.arco-input-prefix) {
      padding-right: 0;
    }
  }
</style>
