<script setup lang="ts">
  import SvgIcon from '@/components/svgIcon'
  const buttonList = [
    {
      name: 'square',
      icon: 'bx-square',
    },
    {
      name: 'circle',
      icon: 'bx-circle',
    },
    {
      name: 'star',
      icon: 'bx-star',
    },
  ]
</script>

<template>
  <a-space>
    <a-button v-for="button in buttonList" :key="button.name">
      <template #icon>
        <SvgIcon :name="button.icon" />
      </template>
    </a-button>
  </a-space>
</template>

<style scoped lang="less"></style>
