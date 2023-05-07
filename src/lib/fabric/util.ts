import { util as utilOrgin } from 'fabric'
import { Board } from './shapes/board'

const isBoard = (object: any): object is Board => {
  return object instanceof Board
}

export const util = { ...utilOrgin, isBoard }
