import { useCanvasStore } from '@/store'
import { useResizeObserver, useThrottleFn } from '@vueuse/core'
import { h } from 'vue'

export default defineComponent({
  setup() {
    const { canvas } = storeToRefs(useCanvasStore())
    const divRef = ref<HTMLDivElement>()
    onMounted(() => {
      divRef.value?.append(canvas.value.wrapperEl)

      // Set the dimensions of the canvas based on the size of the div element
      const throttledFn = useThrottleFn((entries) => {
        const entry = entries[0]
        const { width, height } = entry.contentRect
        canvas.value.setDimensions({ width, height })
      }, 50)
      useResizeObserver(divRef, throttledFn)
    })

    return { divRef }
  },
  render() {
    return h('div', { ref: 'divRef', class: 'h-full' })
  },
})
