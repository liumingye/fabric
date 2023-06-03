<script setup lang="ts">
  import type { useEditor } from '@/app'

  const { canvas } = inject<typeof useEditor>('useEditor')!()
</script>

<template>
  <div class="p2">
    <div>测试插件插槽</div>
    <template v-for="(value, key) in canvas.activeObject.value?.ref" :key="key">
      <div>{{ key }}: {{ value }}</div>
    </template>
  </div>
</template>
