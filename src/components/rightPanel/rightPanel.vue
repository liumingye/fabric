<script setup lang="ts">
  import LayoutAlign from './layoutAlign.vue'
  import BaseAttr from './baseAttr.vue'
  import { useAppStore } from '@/store'
  import { isDefined } from '@vueuse/core'

  const { activeObject } = storeToRefs(useAppStore())

  const componentList = computed(() => [
    {
      name: 'LayoutAlign',
      component: LayoutAlign,
      visual: isDefined(activeObject),
    },
    {
      name: 'BaseAttr',
      component: BaseAttr,
      visual: isDefined(activeObject),
    },
  ])
</script>

<template>
  <div class="pb18">
    <template v-for="(com, index) in componentList" :key="com.name">
      <template v-if="com.visual">
        <component :is="com.component" />
        <!-- arco bug 无法设置为0, 等待修复, https://github.com/arco-design/arco-design-vue/pull/2390 -->
        <a-divider v-if="index !== componentList.length - 1" :margin="0.01" />
      </template>
    </template>
  </div>
</template>

<style scoped lang="less"></style>
