import { util as utilOrgin, Gradient, Pattern } from 'fabric'
import type { FabricObject, Group, ActiveSelection } from './fabric'
import { Board } from '@/core/canvas/shapes/board'

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

export const util = { ...utilOrgin, isBoard, isCollection, isGradient, isPattern }
