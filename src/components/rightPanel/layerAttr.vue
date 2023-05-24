<script setup lang="ts">
  import Panel from './panel.vue'
  import { useActiveObjectModel } from './hooks/useActiveObjectModel'

  const opacity = useActiveObjectModel('opacity')
  const globalCompositeOperation = useActiveObjectModel<
    'globalCompositeOperation',
    string | number | Record<string, any> | (string | number | Record<string, any>)[]
  >('globalCompositeOperation')
  const visible = useActiveObjectModel('visible')

  const options = reactive([
    {
      key: 'source-over',
      name: '正常',
    },
    {
      isGroup: true,
      label: '暗色',
      options: [
        {
          key: 'darken',
          name: '变暗',
        },
        {
          key: 'multiply',
          name: '正片叠底',
        },
        {
          key: 'color-burn',
          name: '颜色加深',
        },
      ],
    },
    {
      isGroup: true,
      label: '亮色',
      options: [
        {
          key: 'lighten',
          name: '变亮',
        },
        {
          key: 'screen',
          name: '滤色',
        },
        {
          key: 'color-dodge',
          name: '颜色减淡',
        },
        {
          key: 'lighter',
          name: '提亮',
        },
      ],
    },
    {
      isGroup: true,
      label: '对比',
      options: [
        {
          key: 'overlay',
          name: '叠加',
        },
        {
          key: 'soft-light',
          name: '柔光',
        },
        {
          key: 'hard-light',
          name: '强光',
        },
      ],
    },
    {
      isGroup: true,
      label: '比较',
      options: [
        {
          key: 'difference',
          name: '差集',
        },
        {
          key: 'exclusion',
          name: '排除',
        },
      ],
    },
    {
      isGroup: true,
      label: '颜色',
      options: [
        {
          key: 'hue',
          name: '色相',
        },
        {
          key: 'saturation',
          name: '饱和度',
        },
        {
          key: 'color',
          name: '颜色',
        },
        {
          key: 'luminosity',
          name: '明度',
        },
      ],
    },
  ])

  const popupVisibleChange = (visible: boolean) => {
    if (!visible) return
    // 修改下拉列表最大高度到屏幕最下面
    nextTick(() => {
      const wrapper = document.querySelector<HTMLDivElement>('.arco-select-dropdown-list-wrapper')
      if (!wrapper) return
      wrapper.style.maxHeight = `${window.innerHeight - wrapper.getBoundingClientRect().top - 8}px`
    })
  }
</script>

<template>
  <Panel title="图层" hidden-add>
    <a-row :gutter="[4, 4]" align="center">
      <a-col :span="10">
        <a-select
          size="small"
          v-bind="globalCompositeOperation"
          :options="options"
          :field-names="{ value: 'key', label: 'name' }"
          @popup-visible-change="popupVisibleChange"
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
