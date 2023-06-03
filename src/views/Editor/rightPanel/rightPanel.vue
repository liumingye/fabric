<script setup lang="ts">
  import LayoutAlign from './layoutAlign.vue'
  import BaseAttr from './baseAttr.vue'
  import LayerAttr from './layerAttr.vue'
  import TextAttr from './textAttr.vue'
  import FillAttr from './fillAttr.vue'
  import StrokeAttr from './strokeAttr.vue'
  import { isDefined } from '@vueuse/core'
  import { useEditor, appInstance } from '@/app'
  import { util } from '@fabric'

  const { canvas } = useEditor()

  const componentList = computed(() => {
    const activeObject = canvas.activeObject.value
    return [
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
        visual: isDefined(activeObject) && !util.isActiveSelection(activeObject),
      },
      {
        name: 'TextAttr',
        component: TextAttr,
        visual: isDefined(activeObject) && activeObject.isType('IText', 'Textbox'),
      },
      {
        name: 'FillAttr',
        component: FillAttr,
        visual:
          isDefined(activeObject) &&
          (util.isBoard(activeObject) || !util.isCollection(activeObject)),
      },
      {
        name: 'StrokeAttr',
        component: StrokeAttr,
        visual: isDefined(activeObject) && !util.isCollection(activeObject),
      },
    ]
  })

  const pluginSolts = appInstance.editor.getPluginSlots('rightPanel')
</script>

<template>
  <a-scrollbar
    :style="{
      height: '100%',
      overflow: 'auto',
    }"
    :outer-style="{
      height: '100%',
    }"
  >
    <div class="pb2">
      <template v-for="(com, index) in componentList" :key="com.name">
        <template v-if="com.visual">
          <a-divider v-if="index !== 0" :margin="0" />
          <component :is="com.component" />
        </template>
      </template>
      <template v-for="(com, index) in pluginSolts" :key="index">
        <a-divider v-if="index !== com.length - 1" :margin="0" />
        <component :is="com" />
      </template>
    </div>
  </a-scrollbar>
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
