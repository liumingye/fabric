<script setup lang="ts">
  import Panel from './panel.vue'
  import { useActiveObjectModel } from '@/hooks/useActiveObjectModel'
  import type { SelectProps } from '@arco-design/web-vue/es/select'
  import { popupMaxHeight } from '@/utils/arco'
  import { useEditor } from '@/app'
  import { isDefined } from '@vueuse/core'

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
      value: 'normal',
      label: '常规体',
    },
    {
      value: 'lighter',
      label: '细体',
    },
    {
      value: 'bold',
      label: '粗体',
    },
    {
      value: 'italic',
      label: '斜体',
    },
  ])

  const sizeOptions = reactive(
    [8, 9, 10, 11, 12, 14, 16, 18, 21, 24, 36, 48, 60, 72].map((size) => {
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

  const textStyle = ref()

  const { canvas } = useEditor()

  watchEffect(() => {
    const activeObject = toRaw(canvas.activeObject)
    if (!isDefined(activeObject)) return

    if (activeObject.value.get('fontStyle') === 'italic') {
      textStyle.value = activeObject.value.get('fontStyle')
    } else if (['bold', 'lighter', 'normal'].includes(activeObject.value.get('fontWeight'))) {
      textStyle.value = activeObject.value.get('fontWeight')
    }
  })

  const setTextStyle = (
    value: string | number | Record<string, any> | (string | number | Record<string, any>)[],
  ) => {
    const activeObject = toRaw(canvas.activeObject)
    if (!isDefined(activeObject)) return

    activeObject.value.set('fontStyle', 'normal')
    activeObject.value.set('fontWeight', 'normal')

    if (['bold', 'lighter', 'normal'].includes(value.toString())) {
      activeObject.value.set('fontWeight', value)
    } else if (value === 'italic') {
      activeObject.value.set('fontStyle', value)
    }

    canvas.requestRenderAll()
  }
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
        <a-select
          size="small"
          :model-value="textStyle"
          :options="styleOptions"
          @change="setTextStyle"
        />
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
