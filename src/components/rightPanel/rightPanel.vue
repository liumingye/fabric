<script setup lang="ts">
  import LayoutAlign from './layoutAlign.vue'
  import BaseAttr from './baseAttr.vue'
  import LayerAttr from './layerAttr.vue'
  import FillAttr from './fillAttr.vue'
  import { isDefined } from '@vueuse/core'
  import { useEditor } from '@/app'

  const { canvas } = useEditor()

  const componentList = computed(() => [
    {
      name: 'LayoutAlign',
      component: LayoutAlign,
      visual: true,
    },
    {
      name: 'BaseAttr',
      component: BaseAttr,
      visual: true,
    },
    {
      name: 'LayerAttr',
      component: LayerAttr,
      visual: isDefined(canvas.activeObject),
    },
    {
      name: 'FillAttr',
      component: FillAttr,
      visual: isDefined(canvas.activeObject),
    },
  ])
</script>

<template>
  <div class="pb18">
    <template v-for="(com, index) in componentList" :key="com.name">
      <template v-if="com.visual">
        <component :is="com.component" />
        <a-divider v-if="index !== componentList.length - 1" :margin="0" />
      </template>
    </template>
  </div>
</template>

<style scoped lang="less">
  :deep(.arco-input-wrapper) {
    padding-right: 4px;
    padding-left: 6px;
    height: 28px;

    .arco-input {
      font-size: 12px !important;
    }

    .arco-input-suffix {
      padding-left: 6px;
    }
  }
  :deep(.arco-select-view-value) {
    line-height: initial !important;
    font-size: 12px !important;
  }
  :deep(.arco-select-view-suffix) {
    padding-left: 4px;
  }

  :deep(.arco-input-prefix) {
    padding-right: 0 !important;
    margin-left: -1px;
    margin-right: 4px;
    justify-content: center;

    .arco-btn {
      height: 28px;
      width: 28px;
    }
  }
</style>
