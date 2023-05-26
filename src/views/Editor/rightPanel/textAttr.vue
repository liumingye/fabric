<script setup lang="ts">
  import Panel from './panel.vue'
  import { useActiveObjectModel } from './hooks/useActiveObjectModel'
  import type { SelectProps } from '@arco-design/web-vue/es/select'
  import { popupMaxHeight } from '@/utils/arco'

  const fontOptions = reactive([
    {
      value: 'arial',
      label: 'Arial',
    },
    {
      value: 'Times New Roman',
      label: 'Times New Roman',
    },
    {
      value: 'Microsoft Yahei',
      label: '微软雅黑',
    },
  ])

  const styleOptions = reactive([
    {
      value: '1',
      label: '常规体',
    },
    {
      value: '2',
      label: '粗体',
    },
    {
      value: '3',
      label: '斜体',
    },
  ])

  const sizeOptions = reactive(
    [7, 8, 9, 10, 11, 12, 14, 16, 18, 21, 24, 36, 48, 60, 72].map((size) => {
      return {
        value: size,
        label: size.toString(),
      }
    }),
  )

  const fontFamily = useActiveObjectModel<'fontFamily', SelectProps['modelValue']>('fontFamily')
  const fontSize = useActiveObjectModel<'fontSize', SelectProps['modelValue']>('fontSize') // 字号
  const lineHeight = useActiveObjectModel('lineHeight') // 行号
  const charSpacing = useActiveObjectModel('charSpacing') // 字距
  const textAlign = useActiveObjectModel('textAlign') // 字距
</script>

<template>
  <Panel title="文本" hidden-add>
    <a-row :gutter="[4, 4]">
      <a-col>
        <a-select
          size="small"
          class="mb1"
          v-bind="{ ...fontFamily, ...popupMaxHeight() }"
          :options="fontOptions"
        />
      </a-col>
      <a-col :span="14">
        <a-select size="small" :options="styleOptions" />
      </a-col>
      <a-col :span="10">
        <a-select
          v-bind="{ ...fontSize, ...popupMaxHeight() }"
          size="small"
          :options="sizeOptions"
        />
      </a-col>
    </a-row>
  </Panel>
</template>

<style scoped lang="less"></style>
