<script setup lang="ts">
  import Panel from './panel.vue'
  import { isString } from 'lodash'
  import { Color as FabricColor, Color } from '@fabric'
  import ColorPicker from '@/components/colorPicker'
  import { useEditor } from '@/app'
  import { Fn } from '@vueuse/core'
  import { padHexColor } from '@/utils/fill'

  const { canvas } = useEditor()

  let closeFn: Fn | undefined

  /**
   * 关闭dialog
   */
  const closeColorPicker = () => {
    closeFn && closeFn()
    closeFn = undefined
  }

  const onChange = (value: string) => {
    value = value.replace(/^#/, '')
    if (value.length < 6) {
      value = padHexColor(value)
    }
    const color = new Color(value)
    state.backgroundColor = color.toRgba()
  }

  watch(canvas.activeObject, () => closeColorPicker())

  const openColorPicker = () => {
    closeFn = ColorPicker.open({
      initialColor: canvas.backgroundColor,
      solidColor: true,
      onChange: (data) => {
        if (data.points.length < 1) return
        const [{ red, green, blue, alpha }] = data.points
        state.backgroundColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`
      },
    })
  }

  onUnmounted(() => {
    closeColorPicker()
  })

  const state = reactive({
    backgroundColor: canvas.backgroundColor,
    inputValue: '',
  })

  watch(
    () => state.backgroundColor,
    (value) => {
      if (isString(value)) {
        state.inputValue = new FabricColor(value).toHex().toUpperCase()
      } else {
        state.inputValue = ''
      }
      canvas.set('backgroundColor', value)
      canvas.requestRenderAll()
    },
    {
      immediate: true,
    },
  )
</script>

<template>
  <Panel
    title="画布背景色"
    :disable-add="!!state.backgroundColor"
    @click-add="state.backgroundColor = '#F4F4F4'"
  >
    <a-row :gutter="[4, 4]" align="center">
      <a-col :span="10">
        <a-input size="mini" v-model="state.inputValue" @change="onChange">
          <template #prefix>
            <a-button size="mini" class="icon-btn" @click="openColorPicker">
              <template #icon>
                <div
                  class="w18px h18px rd-4px"
                  :style="{
                    background: state.backgroundColor as string,
                  }"
                ></div>
              </template>
            </a-button>
          </template>
        </a-input>
      </a-col>
      <a-col :span="3.5" class="mlauto">
        <a-button size="small" class="icon-btn" @click="state.backgroundColor = ''">
          <template #icon>
            <icon-minus />
          </template>
        </a-button>
      </a-col>
    </a-row>
  </Panel>
</template>

<style scoped lang="less"></style>
