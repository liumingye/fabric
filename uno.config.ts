// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
  shortcuts: {
    'icon-btn':
      'bg-transparent! hover:bg-$color-secondary-hover! active:bg-$color-secondary-active!',
  },
})
