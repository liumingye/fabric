<script setup lang="ts">
  import type { useEditor } from '@/app'
  import { Trace } from '@/core/instantiation/instantiationService'

  const { canvas } = inject<typeof useEditor>('useEditor')!()

  const printTrace = () => {
    if (Trace.all.size === 0) {
      console.log('Enable via `instantiationService.ts#_enableAllTracing`')
      return
    }

    for (const item of Trace.all) {
      console.log(item)
    }
  }
</script>

<template>
  <div class="p2">
    <div>测试插件插槽</div>
    <a-button @click="printTrace" hidden>打印Trace</a-button>
    <template v-for="(value, key) in canvas.activeObject.value?.ref" :key="key">
      <div>{{ key }}: {{ value }}</div>
    </template>
  </div>
</template>
