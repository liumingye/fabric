<script setup lang="ts">
  import SvgIcon from '@/components/svgIcon.vue'
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
  <div>
    <a-space>
      <a-button v-for="button in buttonList" :key="button.name">
        <template #icon>
          <SvgIcon :name="button.icon" />
        </template>
      </a-button>
    </a-space>
  </div>
</template>

<style scoped lang="less"></style>
