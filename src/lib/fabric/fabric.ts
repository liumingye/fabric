// 原型
export * from 'fabric'
export { Object as FabricObject } from 'fabric'

// 重写
export { util } from './util'
export { Group } from './group'
import './canvas/staticCanvas'
import './object'

// 元素
export { Board } from './shapes/board'

export type * from './types'
