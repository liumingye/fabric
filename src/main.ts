import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import pinia from '@/store'
import { createCore } from '@/core'

import '@unocss/reset/tailwind-compat.css'
import '@/assets/style/global.less'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'

const core = createCore()
// debug code
import { myPlugin } from './core/testPlugin'
core.use(myPlugin)

createApp(App).use(pinia).use(router).use(core).mount('#app')

document.body.setAttribute('arco-theme', 'dark')
