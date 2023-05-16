<script setup lang="ts">
  import HeaderBar from '@/components/headerBar'
  import CanvasEdit from '@/components/canvasEdit'
  import LeftPanel from '@/components/leftPanel'
  import RightPanel from '@/components/rightPanel'

  const onContextmenu = (e: MouseEvent) => {
    if (!e.target || !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
      e.preventDefault()
    }
  }
</script>

<template>
  <div @contextmenu="onContextmenu">
    <a-layout class="h-screen">
      <a-layout-header class="bg-$color-bg-4 b-solid b-b b-$color-neutral-3">
        <HeaderBar />
      </a-layout-header>
      <a-layout>
        <a-layout-sider class="bg-$color-bg-4 z1" :width="240">
          <LeftPanel />
        </a-layout-sider>
        <a-layout-content>
          <CanvasEdit />
        </a-layout-content>
        <a-layout-sider class="bg-$color-bg-4" :width="240">
          <RightPanel />
        </a-layout-sider>
      </a-layout>
    </a-layout>
  </div>
</template>

<style scoped lang="less">
  :global(body) {
    overflow: hidden;
  }
</style>
