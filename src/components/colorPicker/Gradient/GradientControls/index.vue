<template>
  <div class="gradient-controls">
    <a-radio-group
      :model-value="type"
      type="button"
      @change="(type) => changeGradientControl(type as ColorType)"
    >
      <a-radio value="color">纯色</a-radio>
      <a-radio value="linear">线性</a-radio>
      <a-radio value="radial">径向</a-radio>
    </a-radio-group>
  </div>
</template>

<script lang="ts" setup>
  import { ColorType } from '@/components/colorPicker/interface'

  defineProps<{
    type: ColorType
    changeGradientControl: (type: ColorType) => void
  }>()
</script>

<style lang="less" scoped>
  .arco-radio-group-button {
    width: 100%;

    .arco-radio-button {
      flex: 1;
      text-align: center;
    }
  }
</style>
