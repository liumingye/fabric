import { createPinia } from 'pinia'
import { useCanvasStore } from './modules/canvas/canvas'

const pinia = createPinia()

export default pinia

export { useCanvasStore }
