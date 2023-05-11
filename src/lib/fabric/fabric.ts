// 原型
export * from 'fabric'
export { Object as FabricObject } from 'fabric'

// 重写
export { util } from './util'
import './canvas/staticCanvas'
import './object'

// 元素
export { Group } from '@/editor/canvas/shapes/group'
export { Board } from '@/editor/canvas/shapes/board'

export type * from './types'
