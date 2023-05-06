<script setup lang="ts">
  import { initMousetrap } from '@/lib/mousetrap'

  onMounted(() => {
    // 快捷键 初始化
    initMousetrap()
  })
</script>

<template>
  <a-config-provider>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </a-config-provider>
</template>

<style scoped lang="less"></style>
