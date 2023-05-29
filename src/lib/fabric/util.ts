import { util as utilOrgin } from 'fabric'
import { FabricObject, Group, ActiveSelection, Gradient, Pattern } from '@fabric'
import { Board } from '@/core/canvas/shapes/board'

const isActiveSelection = (object: any): object is ActiveSelection => {
  return object instanceof ActiveSelection
}

const isBoard = (object: any): object is Board => {
  return object instanceof Board
}

const isCollection = (fabricObject?: FabricObject): fabricObject is Group | ActiveSelection => {
  return !!fabricObject && Array.isArray((fabricObject as Group)._objects)
}

// 类型工具
const isGradient = (obj: unknown): obj is Gradient<'linear'> | Gradient<'radial'> =>
  obj instanceof Gradient

const isPattern = (obj: unknown): obj is Pattern => obj instanceof Pattern

export const util = {
  ...utilOrgin,
  isBoard,
  isCollection,
  isGradient,
  isPattern,
  isActiveSelection,
}
