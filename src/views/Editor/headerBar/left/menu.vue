<script setup lang="ts">
  import ContextMenu from '@/components/contextMenu'
  import { useImport } from '@/hooks/useImport'

  const { exportPages, importPages, exportImage } = useImport()

  const showMenu = (e: MouseEvent) => {
    ContextMenu.showContextMenu({
      x: e.clientX,
      y: e.clientY,
      preserveIconWidth: false,
      items: [
        {
          label: '导入',
          onClick: importPages,
        },
        {
          label: '导出',
          onClick: exportPages,
        },
        {
          label: '导出图片',
          onClick: exportImage,
        },
      ],
    })
  }
</script>

<template>
  <a-button @click="showMenu">
    <template #icon>
      <icon-menu />
    </template>
  </a-button>
</template>

<style scoped lang="less"></style>
