<script setup lang="ts">
  import { useAppStore } from '@/store'
  import NP from 'number-precision'
  import ContextMenu from '@/components/contextMenu'
  import type { ButtonInstance } from '@arco-design/web-vue/es/button'
  import { Input } from '@arco-design/web-vue'
  import { isDefined } from '@vueuse/core'
  import { useEditor } from '@/app'
  import { isNumber } from 'lodash'
  import { zoomItems } from '@/utils/contextMenu'

  const { zoom } = storeToRefs(useAppStore())
  const { canvas, keybinding } = useEditor()

  const button = ref<ButtonInstance>()

  const inputValue = ref<string>()
  watchEffect(() => {
    inputValue.value = NP.times(zoom.value, 100) + '%'
  })

  const openMenu = (e: MouseEvent) => {
    let x = e.clientX
    let y = e.clientY
    if (isDefined(button)) {
      const rect = button.value?.$el.getBoundingClientRect()
      x = Math.max(rect.x - 8, 0)
      y = rect.y + rect.height + 8
    }
    ContextMenu.showContextMenu({
      x,
      y,
      preserveIconWidth: false,
      items: [
        {
          customRender: () =>
            h(
              'div',
              {
                class: 'p2',
              },
              h(
                Input,
                {
                  size: 'small',
                  modelValue: inputValue.value,
                  'onUpdate:modelValue': (value: string) => {
                    inputValue.value = value
                  },
                  onChange: (value) => {
                    const zoom = parseInt(value)
                    if (!isNumber(zoom) || Number.isNaN(zoom)) return
                    canvas.zoomToPoint(canvas.getCenterPoint(), NP.divide(zoom, 100))
                  },
                },
                {},
              ),
            ),
        },
        ...zoomItems(),
        {
          label: '50%',
          onClick: () => {
            canvas.zoomToPoint(canvas.getCenterPoint(), 0.5)
          },
        },
        {
          label: '100%',
          onClick: () => {
            keybinding.trigger('mod+0')
          },
          shortcut: `${keybinding.mod} 0`,
        },
        {
          label: '200%',
          onClick: () => {
            canvas.zoomToPoint(canvas.getCenterPoint(), 2)
          },
          divided: true,
        },
        {
          label: '显示全部',
          onClick: () => {
            keybinding.trigger('mod+1')
          },
          shortcut: `${keybinding.mod} 1`,
        },
        {
          label: '显示选中内容',
          onClick: () => {
            keybinding.trigger('mod+2')
          },
          disabled: !isDefined(canvas.activeObject),
          shortcut: `${keybinding.mod} 2`,
        },
      ],
    })
  }
</script>

<template>
  <a-button ref="button" class="icon-btn px2" @click="openMenu">
    {{ NP.times(zoom, 100) }}%
    <icon-down class="ml1" />
  </a-button>
</template>

<style scoped lang="less"></style>
