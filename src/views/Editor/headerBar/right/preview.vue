<script setup lang="ts"></script>

<template>
  <a-space>
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
