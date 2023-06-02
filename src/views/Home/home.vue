<script setup lang="ts"></script>

<template>
  <a-button
    @click="
      $router.push({
        name: 'Editor',
      })
    "
  >
    进入编辑器
  </a-button>
</template>
