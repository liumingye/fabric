<script setup lang="ts">
  import HeaderBar from '@/views/Editor/headerBar'
  import CanvasEdit from '@/views/Editor/canvasEdit'
  import LeftPanel from '@/views/Editor/leftPanel'
  import RightPanel from '@/views/Editor/rightPanel'
  import { getActiveCore } from '@/core'

  const onContextmenu = (e: MouseEvent) => {
    if (!e.target || !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
      e.preventDefault()
    }
  }

  const { app } = getActiveCore()

  onMounted(() => {
    app.editor.startup()
  })

  onUnmounted(() => {
    app.editor.dispose()
  })
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
  // :global(#app) {
  //   position: absolute;
  //   left: 0;
  //   right: 0;
  //   top: 0;
  //   bottom: 0;
  // }

  :global(body) {
    overflow: hidden;
  }
</style>
