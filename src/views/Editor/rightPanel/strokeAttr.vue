<script setup lang="ts">
  import Panel from './panel.vue'
  import { useActiveObjectModel } from '@/hooks/useActiveObjectModel'
  import { useEditor } from '@/app'
  import SwipeNumber from '@/components/swipeNumber'
  import type { SelectProps } from '@arco-design/web-vue/es/select'
  import { useColor } from '@/hooks/useActiveObjectColor'

  const { canvas } = useEditor()

  const stroke = useActiveObjectModel('stroke')
  const strokeWidth = useActiveObjectModel('strokeWidth')
  const paintFirst = useActiveObjectModel<'paintFirst', SelectProps['modelValue']>('paintFirst')

  const { formatValue, colorBlock, changeColor, closeColorPicker, openColorPicker, readonly } =
    useColor(
      computed(() => stroke.value.modelValue),
      {
        attr: 'stroke',
        onChange(value) {
          stroke.value.onChange(value)
        },
      },
    )

  watch(canvas.activeObject, () => closeColorPicker())

  const options = reactive([
    {
      value: 'fill',
      label: '内部',
    },
    {
      value: 'stroke',
      label: '外部',
    },
  ])
</script>

<template>
  <Panel
    title="边框"
    :disable-add="!!strokeWidth.modelValue"
    @click-add="
      () => {
        if (stroke.modelValue === null) {
          stroke.onChange('#979797')
        }
        strokeWidth.onChange(1)
      }
    "
  >
    <a-row :gutter="[4, 4]" align="center">
      <a-col :span="10">
        <a-input
          size="mini"
          v-model="formatValue"
          :readonly="readonly"
          @change="changeColor"
          class="pl0!"
        >
          <template #prefix>
            <a-button size="mini" class="icon-btn" @click="openColorPicker">
              <template #icon>
                <div v-bind="colorBlock"></div>
              </template>
            </a-button>
          </template>
        </a-input>
      </a-col>
      <a-col :span="10">
        <SwipeNumber size="small" :min="1" label="W" v-bind="strokeWidth" :hide-button="false" />
      </a-col>
      <a-col :span="3.5" class="mlauto">
        <a-button size="small" class="icon-btn" @click="strokeWidth.onChange(0)">
          <template #icon>
            <icon-minus />
          </template>
        </a-button>
      </a-col>
      <a-col :span="10">
        <a-select size="small" v-bind="paintFirst" :options="options" />
      </a-col>
    </a-row>
  </Panel>
</template>

<style scoped lang="less"></style>
