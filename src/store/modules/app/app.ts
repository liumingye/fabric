import type { EditTool } from '@/types'

export const useAppStore = defineStore('app', () => {
  const zoom = ref<number>(0)
  const activeTool = ref<EditTool>('move')

  return {
    /** 当前激活的工具 */
    activeTool,
    zoom,
  }
})
