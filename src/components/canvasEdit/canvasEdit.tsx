import { useResizeObserver, useThrottleFn } from '@vueuse/core'
import { useEditor } from '@/app'
import { h } from 'vue'

export default defineComponent({
  setup() {
    const { canvas } = useEditor()

    const divRef = ref<HTMLDivElement>()
    onMounted(() => {
      divRef.value?.append(canvas.lowerCanvasEl, canvas.upperCanvasEl)

      // Set the dimensions of the canvas based on the size of the div element
      const throttledFn = useThrottleFn((entries) => {
        const entry = entries[0]
        const { width, height } = entry.contentRect
        canvas.setDimensions({ width, height })
      }, 50)
      useResizeObserver(divRef, throttledFn)
    })

    return { divRef }
  },
  render() {
    return h('div', { ref: 'divRef', class: 'relative h-full bg-$color-fill-1' })
  },
})
