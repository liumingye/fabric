import { Editor, EditorPluginContext } from '../types'

const myPlugin = (editor: Editor): EditorPluginContext => {
  const setup = () => {
    console.log('myPlugin 插件安装')
    console.log(editor)
  }
  return {
    setup,
  }
}

export { myPlugin }
