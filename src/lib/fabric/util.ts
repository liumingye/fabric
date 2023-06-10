import { util as utilOrgin } from 'fabric'
import { FabricObject, ActiveSelection, Gradient, Pattern, Text, Group, Canvas } from '@fabric'
import { Group as NativeGroup } from 'fabric'
import { Board } from '@/core/canvas/shapes/board'

// 类型工具

const isActiveSelection = (thing: unknown): thing is ActiveSelection => {
  return thing instanceof ActiveSelection
}

const isBoard = (thing: unknown): thing is Board => {
  return thing instanceof Board
}

const isGroup = (thing?: unknown): thing is Group => {
  return thing instanceof Group
}

const isCollection = (thing?: unknown): thing is Group | ActiveSelection | Canvas => {
  return !!thing && Array.isArray((thing as Group)._objects)
}

/**
 * 判断是否为原生组
 * @param thing
 * @returns NativeGroup | Group | Board
 */
const isNativeGroup = (thing?: unknown): thing is NativeGroup => {
  return thing instanceof NativeGroup
}

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
  isGroup,
  isNativeGroup,
}
