<script lang="ts" setup>
  import { useMounted, useDraggable } from '@vueuse/core'

  const props = defineProps<{
    hideClose?: boolean
    onClose?: () => void
    top?: number
    left?: number
    width?: number
    height?: number
  }>()

  const emit = defineEmits<{
    (e: 'close'): void
  }>()

  const mounted = useMounted()

  const el = ref<HTMLDivElement>()
  const handle = ref<HTMLDivElement>()

  const { style } = useDraggable(el, {
    initialValue: { x: props.left ?? 0, y: props.top ?? 0 },
    handle,
  })

  const handleClose = () => {
    emit('close')
  }

  defineExpose({
    handleClose,
  })
</script>

<template>
  <div class="dialog-container">
    <div
      v-if="mounted"
      ref="el"
      class="absolute flex flex-col bg-$color-bg-3 rounded-md z1000 shadow-lg"
      :style="[
        {
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined,
        },
        style,
      ]"
    >
      <div ref="handle" class="flex items-center p1 border-b border-$color-border-2">
        <div class="truncate flex-1 pl2">
          <slot name="title"></slot>
        </div>
        <div v-if="!hideClose">
          <a-button size="mini" class="icon-btn" @click="handleClose">
            <template #icon>
              <IconClose />
            </template>
          </a-button>
        </div>
      </div>
      <div class="flex-shrink-0">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
