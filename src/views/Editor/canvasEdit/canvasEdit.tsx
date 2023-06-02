import { useResizeObserver } from '@vueuse/core'
import { useEditor } from '@/app'
import { h } from 'vue'

export default defineComponent({
  setup() {
    const { canvas } = useEditor()

    const divRef = ref<HTMLDivElement>()

    onMounted(() => {
      divRef.value?.append(canvas.lowerCanvasEl, canvas.upperCanvasEl)

      // Set the dimensions of the canvas based on the size of the div element
      useResizeObserver(divRef, (entries) => {
        const [entry] = entries
        const { width, height } = entry.contentRect
        if (canvas.lowerCanvasEl) {
          canvas.setDimensions({ width, height })
        }
      })
    })

    return { divRef }
  },
  render() {
    return h('div', { ref: 'divRef', class: 'relative h-full w-full bg-$color-fill-1' })
  },
})
