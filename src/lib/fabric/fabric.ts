// 原型
export * from 'fabric'
export { Object as FabricObject } from 'fabric'

// 重写
export { util } from './util'
import './canvas/staticCanvas'
import './object'

// 元素
export { Group } from '@/core/canvas/shapes/group'
export { Board } from '@/core/canvas/shapes/board'

export type * from './types'
