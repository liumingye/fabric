<script setup lang="ts">
  import ContextMenu from '@/components/contextMenu'
  import { useImport } from '@/hooks/useImport'

  const { exportPages, importPages } = useImport()

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
