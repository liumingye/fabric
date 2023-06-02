<script setup lang="ts">
  import HeaderBar from '@/views/Editor/headerBar'
  import CanvasEdit from '@/views/Editor/canvasEdit'
  import LeftPanel from '@/views/Editor/leftPanel'
  import RightPanel from '@/views/Editor/rightPanel'
  import { getActiveCore } from '@/core'
  import { appInstance } from '@/app'
  import { EditorMain } from '@/app/editor'

  const onContextmenu = (e: MouseEvent) => {
    const target = (e.target || e.srcElement) as HTMLElement | undefined

    const isInputOrTextArea = target && ['INPUT', 'TEXTAREA', 'TEXT'].includes(target.tagName)
    const isDisabledInput = isInputOrTextArea && (target as HTMLInputElement).disabled

    if (!target || !isInputOrTextArea || isDisabledInput) {
      e.preventDefault()
    }
  }

  onBeforeMount(() => {
    const { service } = getActiveCore()
    appInstance.editor = service.createInstance(EditorMain)
    appInstance.editor.startup()
  })

  onUnmounted(() => {
    appInstance.editor.dispose()
  })
</script>

<template>
  <div @contextmenu="onContextmenu">
    <a-layout class="h-screen">
      <a-layout-header class="bg-$color-bg-4! b-solid b-b b-$color-neutral-3">
        <HeaderBar />
      </a-layout-header>
      <a-layout>
        <a-layout-sider class="bg-$color-bg-4! z1" :width="240">
          <LeftPanel />
        </a-layout-sider>
        <a-layout-content>
          <CanvasEdit />
        </a-layout-content>
        <a-layout-sider class="bg-$color-bg-4!" :width="240">
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
