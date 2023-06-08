import { util as utilOrgin } from 'fabric'
import { FabricObject, Group, ActiveSelection, Gradient, Pattern, Text } from '@fabric'
import { Board } from '@/core/canvas/shapes/board'

const isActiveSelection = (thing: unknown): thing is ActiveSelection => {
  return thing instanceof ActiveSelection
}

const isBoard = (thing: unknown): thing is Board => {
  return thing instanceof Board
}

const isCollection = (thing?: FabricObject): thing is Group | ActiveSelection => {
  return !!thing && Array.isArray((thing as Group)._objects)
}

// 类型工具
const isGradient = (thing: unknown): thing is Gradient<'linear' | 'radial'> => {
  return thing instanceof Gradient
}

const isPattern = (thing: unknown): thing is Pattern => {
  return thing instanceof Pattern
}

const isTextObject = (thing?: FabricObject): thing is Text => {
  // we could use instanceof but that would mean pulling in Text code for a simple check
  // @todo discuss what to do and how to do
  return !!thing && thing.isType('Text', 'IText', 'Textbox')
}

export const util = {
  ...utilOrgin,
  isBoard,
  isCollection,
  isGradient,
  isPattern,
  isActiveSelection,
  isTextObject,
}
