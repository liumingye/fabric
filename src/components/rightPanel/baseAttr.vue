<script setup lang="ts">
  import SwipeNumber from '../swipeNumber/swipeNumber.vue'

  const number = ref(0)
</script>

<template>
  <div class="p2">
    <a-row :gutter="[4, 4]">
      <a-col :span="10">
        <SwipeNumber v-model="number" label="X" />
      </a-col>
      <a-col :span="10">
        <SwipeNumber v-model="number" label="Y" />
      </a-col>
      <a-col :span="10">
        <SwipeNumber v-model="number" label="W" />
      </a-col>
      <a-col :span="10">
        <SwipeNumber v-model="number" label="H" />
      </a-col>
    </a-row>
  </div>
</template>

<style scoped lang="less"></style>
