<script setup lang="ts">
  import Panel from './panel.vue'
  import { useActiveObjectModel } from './hooks/useActiveObjectModel'
</script>

<template>
  <Panel title="文本" hidden-add>
    <a-select></a-select>
  </Panel>
</template>

<style scoped lang="less"></style>
