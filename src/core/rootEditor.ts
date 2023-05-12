import { IEditor } from './types'

export let activeEditor: IEditor

export const setActiveEditor = (editor: IEditor) => (activeEditor = editor)

export const getActiveEditor = () => activeEditor
