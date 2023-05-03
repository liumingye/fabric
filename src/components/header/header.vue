<script setup lang="ts">
  import Tool from './tool.vue'
  import Zoom from './zoom.vue'
  import Title from './title.vue'
  import Preview from './preview.vue'
</script>

<template>
  <div class="flex items-center h-12 px-2">
    <div class="flex-1 flex">
      <Tool />
      <Zoom />
    </div>
    <div class="truncate">
      <Title />
    </div>
    <div class="flex-1 flex justify-end">
      <Preview />
    </div>
  </div>
</template>

<style scoped lang="less"></style>
