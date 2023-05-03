import { createRouter, createWebHashHistory } from 'vue-router'

import Editor from '@/views/Editor/Editor.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Editor',
      component: Editor,
    },
  ],
})

export default router
