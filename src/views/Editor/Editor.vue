<script setup lang="ts">
  import HeaderBar from '@/components/headerBar'
  import CanvasEdit from '@/components/canvasEdit'
  import LeftPanel from '@/components/leftPanel'
  import RightPanel from '@/components/rightPanel'
</script>

<template>
  <div>
    <a-layout class="h-screen">
      <a-layout-header class="bg-$color-bg-2 b-solid b-b b-$color-neutral-3">
        <HeaderBar />
      </a-layout-header>
      <a-layout>
        <a-layout-sider :width="240">
          <LeftPanel />
        </a-layout-sider>
        <a-layout-content>
          <CanvasEdit />
        </a-layout-content>
        <a-layout-sider :width="240">
          <RightPanel />
        </a-layout-sider>
      </a-layout>
    </a-layout>
  </div>
</template>

<style scoped lang="less"></style>
