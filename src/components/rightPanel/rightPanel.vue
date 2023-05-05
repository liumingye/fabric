<script setup lang="ts">
  import LayoutAlign from './layoutAlign.vue'
  import BaseAttr from './baseAttr.vue'

  const componentList = [
    { name: 'LayoutAlign', component: LayoutAlign },
    { name: 'BaseAttr', component: BaseAttr },
    // { name: 'LayoutAlign', component: LayoutAlign },
  ]
</script>

<template>
  <div class="pb18">
    <template v-for="(com, index) in componentList" :key="com.name">
      <component :is="com.component" />
      <!-- arco bug 无法设置为0, 等待修复, https://github.com/arco-design/arco-design-vue/pull/2390 -->
      <a-divider v-if="index !== componentList.length - 1" :margin="0.01" />
    </template>
  </div>
</template>

<style scoped lang="less"></style>
