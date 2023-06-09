<script setup lang="ts">
  import SvgIcon from '@/components/svgIcon'
  import { useAppStore } from '@/store'
  import type { EditTool } from 'app'

  const { activeTool } = storeToRefs(useAppStore())

  const buttonList: {
    name: EditTool
    icon: string
  }[] = [
    {
      name: 'move',
      icon: 'bxs-pointer',
    },
    {
      name: 'handMove',
      icon: 'bxs-hand',
    },
    {
      name: 'vector',
      icon: 'bx-pen',
    },
    {
      name: 'rect',
      icon: 'bx-square',
    },
    {
      name: 'ellipse',
      icon: 'bx-circle',
    },
    {
      name: 'triangle',
      icon: 'bx-triangle',
    },
    {
      name: 'text',
      icon: 'bx-text',
    },
  ]

  const onClick = (toolName: EditTool) => {
    activeTool.value = toolName
  }
</script>

<template>
  <a-space>
    <a-button
      :class="{
        'icon-btn': activeTool !== button.name,
      }"
      :type="activeTool === button.name ? 'primary' : 'secondary'"
      v-for="button in buttonList"
      :key="button.name"
      @click="onClick(button.name)"
    >
      <template #icon>
        <SvgIcon :name="button.icon" />
      </template>
    </a-button>
  </a-space>
</template>

<style scoped lang="less"></style>
