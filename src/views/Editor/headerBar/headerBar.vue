<script setup lang="ts">
  import { isDefined } from '@vueuse/core'
  import { useEditor } from '@/app'
  import Tool from './tool.vue'
  import Zoom from './zoom.vue'
  import ToolBar from './toolBar'
  import Title from './title'
  import Preview from './preview.vue'

  const { canvas } = useEditor()
</script>

<template>
  <div class="flex items-center h-12 px-2">
    <div class="flex-1 flex items-center">
      <Tool />
      <a-divider direction="vertical" />
      <Zoom />
    </div>
    <div class="truncate">
      <ToolBar v-if="isDefined(canvas.activeObject)" />
      <Title v-else />
    </div>
    <div class="flex-1 flex justify-end">
      <Preview />
    </div>
  </div>
</template>

<style scoped lang="less"></style>
