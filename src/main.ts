import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import pinia from '@/store'
import { createEditor, useEditor } from '@/core'

import '@unocss/reset/tailwind-compat.css'
import '@/assets/style/global.less'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'

createApp(App).use(pinia).use(router).use(createEditor()).mount('#app')

// debug code
import { myPlugin } from './core/testPlugin'
const editor = useEditor()
// editor.use(myPlugin)

document.body.setAttribute('arco-theme', 'dark')
