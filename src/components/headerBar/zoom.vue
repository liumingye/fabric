<script setup lang="ts">
  import { useAppStore } from '@/store'
  import { toFixed } from '@/utils/math'

  const { zoom } = storeToRefs(useAppStore())
</script>

<template>
  <div>{{ toFixed(zoom * 100, 0) }}%</div>
</template>

<style scoped lang="less"></style>
