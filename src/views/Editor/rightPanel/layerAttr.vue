<script setup lang="ts">
  import Panel from './panel.vue'
  import { useActiveObjectModel } from '@/hooks/useActiveObjectModel'
  import { popupMaxHeight } from '@/utils/arco'

  const opacity = useActiveObjectModel('opacity')
  const globalCompositeOperation = useActiveObjectModel<
    'globalCompositeOperation',
    string | number | Record<string, any> | (string | number | Record<string, any>)[]
  >('globalCompositeOperation')
  const visible = useActiveObjectModel('visible')

  const options = reactive([
    {
      value: 'source-over',
      label: '正常',
    },
    {
      isGroup: true,
      label: '暗色',
      options: [
        {
          value: 'darken',
          label: '变暗',
        },
        {
          value: 'multiply',
          label: '正片叠底',
        },
        {
          value: 'color-burn',
          label: '颜色加深',
        },
      ],
    },
    {
      isGroup: true,
      label: '亮色',
      options: [
        {
          value: 'lighten',
          label: '变亮',
        },
        {
          value: 'screen',
          label: '滤色',
        },
        {
          value: 'color-dodge',
          label: '颜色减淡',
        },
        {
          value: 'lighter',
          label: '提亮',
        },
      ],
    },
    {
      isGroup: true,
      label: '对比',
      options: [
        {
          value: 'overlay',
          label: '叠加',
        },
        {
          value: 'soft-light',
          label: '柔光',
        },
        {
          value: 'hard-light',
          label: '强光',
        },
      ],
    },
    {
      isGroup: true,
      label: '比较',
      options: [
        {
          value: 'difference',
          label: '差集',
        },
        {
          value: 'exclusion',
          label: '排除',
        },
      ],
    },
    {
      isGroup: true,
      label: '颜色',
      options: [
        {
          value: 'hue',
          label: '色相',
        },
        {
          value: 'saturation',
          label: '饱和度',
        },
        {
          value: 'color',
          label: '颜色',
        },
        {
          value: 'luminosity',
          label: '明度',
        },
      ],
    },
  ])
</script>

<template>
  <Panel title="图层" hidden-add>
    <a-row :gutter="[4, 4]" align="center">
      <a-col :span="10">
        <a-select
          size="small"
          v-bind="{ ...globalCompositeOperation, ...popupMaxHeight() }"
          :options="options"
        />
      </a-col>
      <a-col :span="7">
        <a-inputNumber size="small" v-bind="opacity" hide-button :min="0" :max="100">
          <template #suffix>%</template>
        </a-inputNumber>
      </a-col>
      <a-col :span="7" class="text-end">
        <a-button size="small" class="icon-btn" @click="visible.onChange(!visible.modelValue)">
          <template #icon>
            <icon-eye v-if="visible.modelValue === true" />
            <icon-eye-invisible v-else />
          </template>
        </a-button>
      </a-col>
    </a-row>
  </Panel>
</template>

<style scoped lang="less"></style>
