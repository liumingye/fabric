import { useResizeObserver, useThrottleFn } from '@vueuse/core'
import { useEditorServices } from '@/editor'
import { h } from 'vue'

export default defineComponent({
  setup() {
    const { canvas } = useEditorServices()
    // console.log(useEditorServices())

    const divRef = ref<HTMLDivElement>()
    onMounted(() => {
      divRef.value?.append(canvas.wrapperEl)

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
    return h('div', { ref: 'divRef', class: 'h-full bg-$color-fill-1' })
  },
})
