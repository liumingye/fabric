<script setup lang="ts">
  import { isDefined } from '@vueuse/core'
  import { useEditor } from '@/app'
  import Menu from './left/menu.vue'
  import Tool from './left/tool.vue'
  import Zoom from './left/zoom.vue'
  import Toolbar from './center/toolbar'
  import Title from './center/title'
  import Preview from './right/preview.vue'

  const { canvas } = useEditor()
</script>

<template>
  <div class="flex items-center h-12 px-2">
    <div class="flex-1 flex items-center">
      <Menu />
      <a-divider direction="vertical" />
      <Tool />
      <a-divider direction="vertical" />
      <Zoom />
    </div>
    <div class="truncate">
      <Toolbar v-if="isDefined(canvas.activeObject)" />
      <Title v-else />
    </div>
    <div class="flex-1 flex justify-end">
      <Preview />
    </div>
  </div>
</template>

<style scoped lang="less"></style>
