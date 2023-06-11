import { useResizeObserver } from '@vueuse/core'
import { useEditor } from '@/app'
import { useThemes } from '@/hooks/useThemes'

export default defineComponent({
  setup() {
    const { canvas } = useEditor()

    const divRef = ref<HTMLDivElement>()

    onMounted(() => {
      divRef.value?.append(canvas.wrapperEl)

      // Set the dimensions of the canvas based on the size of the div element
      useResizeObserver(divRef, (entries) => {
        const [entry] = entries
        const { width, height } = entry.contentRect
        if (canvas.lowerCanvasEl) {
          canvas.setDimensions({ width, height })
        }
      })
    })

    const { isDark } = useThemes()

    return { divRef, isDark }
  },
  render() {
    return (
      <div
        ref='divRef'
        class={[
          'relative h-full w-full',
          this.isDark ? ' bg-$color-neutral-1' : ' bg-$color-neutral-2',
        ]}></div>
    )
  },
})
