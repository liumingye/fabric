import { createRouter, createWebHashHistory } from 'vue-router'

import Editor from '@/views/Editor/editor.vue'
import Home from '@/views/Home/home.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/editor',
      name: 'Editor',
      component: Editor,
    },
  ],
})

export default router
