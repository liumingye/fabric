import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ArcoResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    vueJsx(),
    // 自动按需引入组件
    AutoImport({
      resolvers: [
        ArcoResolver({
          // importStyle: 'less',
        }),
      ],
      imports: ['vue', 'vue-router', 'pinia'],
      eslintrc: {
        enabled: true,
      },
    }),
    Components({
      // directoryAsNamespace: true,
      resolvers: [
        // 自动引入arco
        ArcoResolver({
          // importStyle: 'less',
          resolveIcons: true,
        }),
      ],
    }),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
      // 指定symbolId格式
      symbolId: 'icon-[dir]-[name]',
    }),
    UnoCSS(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  server: {
    // hmr: { overlay: false },
    port: 3088,
    open: false,
    cors: false,
    host: '0.0.0.0',
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'font-size-body-1': '12px',
          'font-size-body-2': '12px',
          'font-size-body-3': '12px',
        },
        javascriptEnabled: true,
      },
    },
  },
})
