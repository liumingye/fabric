<script setup lang="ts">
  import layerCatalogue from './layerCatalogue.vue'
  import BasicModule from "@/views/Editor/settingMenu/basicModule.vue";
</script>

<template>
  <a-tabs default-active-key="1" class="leftPanel flex flex-col">
    <a-tab-pane key="2" title="图层">
      <layerCatalogue />
    </a-tab-pane>
    <a-tab-pane key="1" title="基本组件">
      <div class="p2">基本组件</div>
      <basic-module></basic-module>
    </a-tab-pane>
    <a-tab-pane key="3" title="摄像头">
      <div class="p2">摄像头</div>
    </a-tab-pane>
    <a-tab-pane key="4" title="其他">
      <div class="p2">其他</div>
    </a-tab-pane>
  </a-tabs>
</template>

<style scoped lang="less">
  .leftPanel {
    :deep(.arco-tabs) {
      &-content {
        padding-top: 0;
        flex: auto;
        &-list {
          height: 100%;
        }
      }

      &-pane {
        height: 100%;
      }

      &-tab-active,
      &-tab-active:hover {
        color: rgb(var(--color-text-1));
      }

      &-nav-ink {
        background-color: var(--color-text-1);
        box-sizing: content-box;
        padding: 0 10px;
        margin: 0 -10px;
      }
    }
  }
</style>
