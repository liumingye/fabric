import { Editor } from './types'

export let activeEditor: Editor

export const setActiveEditor = (editor: Editor) => (activeEditor = editor)

export const getActiveEditor = () => activeEditor
