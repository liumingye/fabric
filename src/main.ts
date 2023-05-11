import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import pinia from '@/store'
import { createEditor } from '@/editor'

import '@unocss/reset/tailwind-compat.css'
import '@/assets/style/global.less'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'

const editor = createEditor()
// debug code
import { myPlugin } from '@/editor/testPlugin'
editor.use(myPlugin)

createApp(App).use(pinia).use(router).use(editor).mount('#app')

document.body.setAttribute('arco-theme', 'dark')
