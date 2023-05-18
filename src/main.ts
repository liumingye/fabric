import { App as App2, createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import pinia from '@/store'
import { createCore } from '@/core'
import '@/hooks/useThemes'

import '@unocss/reset/tailwind-compat.css'
import '@/assets/style/global.less'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'

import { Notification, Modal, Message } from '@arco-design/web-vue'

const core = createCore()
// debug code
import { myPlugin } from './core/testPlugin'
core.use(myPlugin)

const patch = (app: App2) => {
  Notification._context = app._context
  Modal._context = app._context
  Message._context = app._context
}

createApp(App).use(pinia).use(router).use(core).use(patch).mount('#app')

// useThemes()
