<script setup lang="ts">
  defineProps<{
    title: string
  }>()
</script>

<template>
  <div class="mb2 font-bold text-xs">{{ title }}</div>
</template>
