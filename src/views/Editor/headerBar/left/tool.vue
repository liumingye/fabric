<script setup lang="ts">
  import SvgIcon from '@/components/svgIcon'
  import DropdownButton from '@/components/dropdown/dropdownButton.vue'
  import { useAppStore } from '@/store'
  import type { EditTool } from 'app'

  const { activeTool } = storeToRefs(useAppStore())

  type EditToolListItem = {
    key: EditTool
    icon: string
    name: string
  }

  type EditToolList = (EditToolListItem & {
    doption?: EditToolListItem[]
  })[]

  const editToolList = ref<EditToolList>([
    {
      key: 'move',
      icon: 'bxs-pointer',
      name: '选择工具',
      doption: [
        {
          key: 'move',
          icon: 'bxs-pointer',
          name: '选择工具',
        },
        {
          key: 'handMove',
          icon: 'bxs-hand',
          name: '移动视图',
        },
      ],
    },
    {
      key: 'board',
      icon: 'artboard',
      name: '画板',
    },
    {
      key: 'rect',
      icon: 'bx-square',
      name: '矩形',
      doption: [
        {
          key: 'rect',
          icon: 'bx-square',
          name: '矩形',
        },
        {
          key: 'ellipse',
          icon: 'bx-circle',
          name: '圆形',
        },
        {
          key: 'triangle',
          icon: 'bx-triangle',
          name: '三角形',
        },
      ],
    },
    {
      key: 'vector',
      icon: 'bx-pen',
      name: '钢笔',
    },
    {
      key: 'text',
      icon: 'bx-text',
      name: '文本',
    },
  ])

  const onClick = (toolName: EditTool) => {
    activeTool.value = toolName
  }
</script>

<template>
  <a-space>
    <DropdownButton
      v-for="(button, index) in editToolList"
      :key="button.key"
      :active="activeTool === button.key"
      @click="onClick(button.key)"
      @select="
        (value) => {
          editToolList[index] = { ...editToolList[index], ...value as EditToolListItem }
          onClick((value as EditToolListItem).key)
        }
      "
    >
      <SvgIcon :name="button.icon" />
      <template #content v-if="button.doption">
        <a-doption v-for="doption in button.doption" :key="doption.key" :value="doption">
          <template #icon>
            <SvgIcon :name="doption.icon" />
          </template>
          {{ doption.name }}
        </a-doption>
      </template>
    </DropdownButton>
  </a-space>
</template>

<style scoped lang="less"></style>
