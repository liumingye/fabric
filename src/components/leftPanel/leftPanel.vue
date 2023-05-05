<script setup lang="ts">
  import layerCatalogue from './layerCatalogue.vue'
</script>

<template>
  <a-tabs default-active-key="1" class="leftPanel h-full flex flex-col">
    <a-tab-pane key="1" title="图层" class="h-full">
      <layerCatalogue class="h-full" />
    </a-tab-pane>
    <a-tab-pane key="2" title="资源">资源</a-tab-pane>
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
    }
  }
</style>
