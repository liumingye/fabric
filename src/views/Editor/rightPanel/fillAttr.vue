<script setup lang="ts">
  import Panel from './panel.vue'
  import { useActiveObjectModel } from '@/hooks/useActiveObjectModel'
  import { useEditor } from '@/app'
  import { useColor } from '@/hooks/useActiveObjectColor'
  import { isNumber } from 'lodash'

  const { canvas } = useEditor()

  const fill = useActiveObjectModel('fill')

  const {
    formatValue,
    colorBlock,
    changeColor,
    changeOpacity,
    opacity,
    closeColorPicker,
    openColorPicker,
    readonly,
  } = useColor(
    computed(() => fill.value.modelValue),
    {
      attr: 'fill',
      onChange(value) {
        fill.value.onChange(value)
      },
    },
  )

  watch(canvas.activeObject, () => closeColorPicker())
</script>

<template>
  <Panel title="填充" :disable-add="!!fill.modelValue" @click-add="fill.onChange('#cccccc')">
    <!-- <div>点击 + 重置并修改多个内容</div> -->
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

      <a-col :span="7" v-if="isNumber(opacity)">
        <a-inputNumber
          size="small"
          v-model="opacity"
          hide-button
          :min="0"
          :max="100"
          @change="changeOpacity"
        >
          <template #suffix>%</template>
        </a-inputNumber>
      </a-col>
      <a-col :span="3.5" class="mlauto">
        <a-button size="small" class="icon-btn" @click="fill.onChange(null)">
          <template #icon>
            <icon-minus />
          </template>
        </a-button>
      </a-col>
    </a-row>
  </Panel>
</template>

<style scoped lang="less"></style>
