<script setup lang="ts">
  import { useEditor } from '@/app'

  const { canvas } = useEditor()
  const pages = ref([])
</script>

<template>
  <a-space>
    <a-button @click="canvas.importPages(pages)"> 导入 </a-button>
    <a-button @click="pages = canvas.exportPages()"> 导出 </a-button>
    <a-button
      @click="
        $router.push({
          name: 'Home',
        })
      "
    >
      退出
    </a-button>
  </a-space>
</template>

<style scoped lang="less"></style>
