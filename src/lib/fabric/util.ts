import { util as utilOrgin } from 'fabric'
import type { FabricObject, Group, ActiveSelection } from './fabric'
import { Board } from './shapes/board'

const isBoard = (object: any): object is Board => {
  return object instanceof Board
}

const isCollection = (fabricObject?: FabricObject): fabricObject is Group | ActiveSelection => {
  return !!fabricObject && Array.isArray((fabricObject as Group)._objects)
}

export const util = { ...utilOrgin, isBoard, isCollection }
