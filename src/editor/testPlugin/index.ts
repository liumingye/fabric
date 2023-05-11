import { createEditorPlugin } from '@/editor'

const myPlugin = createEditorPlugin((editor) => {
  const a = 1 + 1

  return {
    setup() {
      console.log('myPlugin setup' + a)
      console.log(editor)
    },
    dispose() {
      console.log('myPlugin dispose' + a)
    },
  }
})

export { myPlugin }
