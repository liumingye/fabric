import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import pinia from '@/store'
import { createCore } from '@/core'
import '@/hooks/useThemes'
import NP from 'number-precision'

import '@unocss/reset/tailwind-compat.css'
import '@/assets/style/global.less'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'

import { arcoPatch } from '@/utils/arco'

const core = createCore()
// debug code
import { myPlugin } from './core/testPlugin'
core.use(myPlugin)

NP.enableBoundaryChecking(false)

createApp(App).use(pinia).use(router).use(core).use(arcoPatch).mount('#app')
