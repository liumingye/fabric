<script setup lang="ts">
  import layerCatalogue from './layerCatalogue.vue'
</script>

<template>
  <a-tabs default-active-key="1" class="leftPanel flex flex-col">
    <a-tab-pane key="1" title="图层">
      <layerCatalogue />
    </a-tab-pane>
    <a-tab-pane key="2" title="资源">
      <div class="p2">资源</div>
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
