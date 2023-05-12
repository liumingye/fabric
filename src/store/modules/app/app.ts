import type { EditTool } from '@/types'

export const useAppStore = defineStore('app', () => {
  const zoom = ref<number>(0)
  // /** 当前激活的工具 */
  const activeTool = ref<EditTool>('move')

  return {
    /** 画布 */
    // canvas,
    /** 当前选中的对象 */
    // activeObject,
    // activeObject,
    /** 全部的对象 */
    // objects,
    /** 当前激活的工具 */
    activeTool,
    zoom,
  }
})
