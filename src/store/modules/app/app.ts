import { Rect, Point, Board, Group } from '@/types/fabric'
import { random } from 'lodash'
import { useMagicKeys } from '@vueuse/core'
import { useFabricSwipe } from '@/hooks/useFabricSwipe'
import { useFabricEvent } from '@/hooks/useFabricEvent'
// import { canvas as _canvas } from '@/editor'
import { InstantiationCanvas } from '@/editor/instantiation/instantiationCanvas'
import { InstantiationMousetrap } from '@/editor/instantiation/instantiationMousetrap'

type EditTool = 'move' | 'handMove'

export const useAppStore = defineStore('canvas', () => {
  const instantiationCanvas = new InstantiationCanvas()
  const instantiationMousetrap = new InstantiationMousetrap(instantiationCanvas)

  /** 当前激活的工具 */
  const activeTool = ref<EditTool>('move')

  // 监听activeTool
  watch(activeTool, (newValue, oldValue) => {
    // 移动工具关闭元素选中
    if (newValue === 'handMove') {
      instantiationCanvas.skipTargetFind = true
      instantiationCanvas.selection = false
    }
    if (oldValue === 'handMove') {
      instantiationCanvas.skipTargetFind = false
      instantiationCanvas.selection = true
    }
  })

  const { space } = useMagicKeys()

  nextTick(() => {
    // 鼠标中键拖动视窗
    let vpt = instantiationCanvas.viewportTransform
    let lastTool: EditTool | undefined
    let mouseDown = false
    const { lengthX, lengthY, isSwiping } = useFabricSwipe({
      onSwipeStart: (e) => {
        // 判断isSwiping.value，修复双击中键卡在move工具上
        if (!isSwiping.value) return
        vpt = instantiationCanvas.viewportTransform
        if (e.button === 2 && activeTool.value !== 'handMove') {
          lastTool = activeTool.value
          activeTool.value = 'handMove'
          instantiationCanvas.setCursor('grabbing')
        }
        if (e.button === 1 && activeTool.value === 'handMove') {
          instantiationCanvas.setCursor('grabbing')
        }
        mouseDown = true
      },
      onSwipe: () => {
        if (activeTool.value === 'handMove') {
          if (mouseDown) {
            instantiationCanvas.setCursor('grabbing')
            const deltaPoint = new Point(lengthX.value, lengthY.value)
              .scalarDivide(instantiationCanvas.getZoom())
              .transform(vpt)
              .scalarMultiply(-1)
            instantiationCanvas.absolutePan(deltaPoint)
          } else {
            instantiationCanvas.setCursor('grab')
          }
        }
      },
      onSwipeEnd: () => {
        if (lastTool) {
          if (!space.value) {
            activeTool.value = lastTool
          }
          instantiationCanvas.setCursor(instantiationCanvas.defaultCursor)
          lastTool = undefined
        }
        mouseDown = false
      },
    })

    // 空格键切换移动工具
    let _lastTool: EditTool | undefined
    watch(space, (value) => {
      if (value) {
        _lastTool = activeTool.value
        activeTool.value = 'handMove'
        instantiationCanvas.defaultCursor = 'grab'
        instantiationCanvas.setCursor(instantiationCanvas.defaultCursor)
      } else if (_lastTool) {
        activeTool.value = _lastTool
        _lastTool = undefined
        instantiationCanvas.defaultCursor = 'default'
        instantiationCanvas.setCursor(instantiationCanvas.defaultCursor)
      }
    })
  })

  // debug code
  nextTick(() => {
    const board1 = new Board([], {
      top: 0,
      left: 0,
      width: 300,
      height: 300,
      backgroundColor: '#fff',
    })
    const board2 = new Board([], {
      top: 400,
      left: 50,
      width: 300,
      height: 300,
      backgroundColor: '#f2b8ca',
    })
    instantiationCanvas.add(board1, board2)

    const group = new Group(
      [
        new Rect({
          top: random(400, 500),
          left: random(0, 200),
          width: random(50, 100),
          height: random(50, 100),
          fill: '#' + Math.random().toString(16).substring(2, 8),
          strokeWidth: random(0, 10),
          stroke: '#' + Math.random().toString(16).substring(2, 8),
        }),
        new Rect({
          top: random(400, 500),
          left: random(0, 200),
          width: random(50, 100),
          height: random(50, 100),
          fill: '#' + Math.random().toString(16).substring(2, 8),
          strokeWidth: random(0, 10),
          stroke: '#' + Math.random().toString(16).substring(2, 8),
        }),
      ],
      {
        subTargetCheck: true,
        interactive: true,
      },
    )
    instantiationCanvas.add(group)

    for (let index = 0; index < 3; index++) {
      instantiationCanvas.add(
        new Rect({
          top: random(200, 300),
          left: random(400, 600),
          width: random(50, 100),
          height: random(50, 100),
          fill: '#' + Math.random().toString(16).substring(2, 8),
          strokeWidth: random(0, 10),
          stroke: '#' + Math.random().toString(16).substring(2, 8),
        }),
      )
      board1.add(
        new Rect({
          top: random(0, 200),
          left: random(0, 200),
          width: random(50, 100),
          height: random(50, 100),
          fill: '#' + Math.random().toString(16).substring(2, 8),
          strokeWidth: random(0, 10),
          stroke: '#' + Math.random().toString(16).substring(2, 8),
        }),
      )
      board2.add(
        new Rect({
          top: random(400, 500),
          left: random(50, 200),
          width: random(50, 100),
          height: random(50, 100),
          fill: '#' + Math.random().toString(16).substring(2, 8),
          strokeWidth: random(0, 10),
          stroke: '#' + Math.random().toString(16).substring(2, 8),
        }),
      )
    }
  })

  /** 画布 */
  const canvas = computed(() => instantiationCanvas)
  const { activeObject, objects } = instantiationCanvas

  return {
    instantiationCanvas,
    instantiationMousetrap,
    /** 画布 */
    canvas,
    /** 当前选中的对象 */
    // activeObject,
    activeObject: computed(() => activeObject.value),
    /** 全部的对象 */
    objects,
    /** 当前激活的工具 */
    activeTool,
  }
})
