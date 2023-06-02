import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import pinia from '@/store'
import { createCore } from '@/core'
import NP from 'number-precision'
import '@/hooks/useThemes'
import { arcoPatch } from '@/utils/arco'

// CSS
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'
import '@/assets/style/global.less'

const core = createCore()
// debug code
import { myPlugin } from './core/testPlugin'
core.use(myPlugin)

NP.enableBoundaryChecking(false)

createApp(App).use(pinia).use(router).use(core).use(arcoPatch).mount('#app')
