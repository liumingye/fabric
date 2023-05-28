import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ArcoResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'
import type { GetModuleInfo } from 'rollup'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import legacy from '@vitejs/plugin-legacy'

const cache = new Map<string, boolean>()

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
      directoryAsNamespace: true,
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
    legacy({
      targets:
        'defaults, > 1%, last 2 versions, not dead, Chrome >= 49, Firefox >= 52, Safari >= 10.1, iOS >= 12.2', // 需要兼容的目标列表
      modernPolyfills: ['es.array.flat-map'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@fabric': resolve(__dirname, './src/lib/fabric'),
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
  build: {
    rollupOptions: {
      output: {
        //静态资源分类打包
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: 'assets/[ext]/[name].[hash].[ext]',
        manualChunks(id, { getModuleInfo }) {
          const cssLangs = `\\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\\?)`
          const cssLangRE = new RegExp(cssLangs)
          const isCSSRequest = (request: string) => cssLangRE.test(request)
          if (
            id.includes('/node_modules/@vue') ||
            id.includes('/node_modules/vue') ||
            id.includes('/node_modules/pinia/') ||
            id.includes('/node_modules/@arco-design/')
          ) {
            return 'vue'
          } else if (
            id.includes('/node_modules/') &&
            !isCSSRequest(id) &&
            staticImportedByEntry(id, getModuleInfo, cache)
          ) {
            return 'vendor'
          }
          if (isCSSRequest(id)) {
            return 'app'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1024,
  },
})

function staticImportedByEntry(
  id: string,
  getModuleInfo: GetModuleInfo,
  cache: Map<string, boolean>,
  importStack: string[] = [],
): boolean {
  if (cache.has(id)) {
    return !!cache.get(id)
  }
  if (importStack.includes(id)) {
    // circular deps!
    cache.set(id, false)
    return false
  }
  const mod = getModuleInfo(id)
  if (!mod) {
    cache.set(id, false)
    return false
  }

  if (mod.isEntry) {
    cache.set(id, true)
    return true
  }
  const someImporterIs = mod.importers.some((importer) =>
    staticImportedByEntry(importer, getModuleInfo, cache, importStack.concat(id)),
  )
  cache.set(id, someImporterIs)
  return someImporterIs
}
