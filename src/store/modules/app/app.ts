import { Rect, Point, Board, Group } from '@/types/fabric'
import { random } from 'lodash'
import { useMagicKeys } from '@vueuse/core'
import { useFabricSwipe } from '@/hooks/useFabricSwipe'
import { useFabricEvent } from '@/hooks/useFabricEvent'
import { useEditorServices } from '@/editor'

type EditTool = 'move' | 'handMove'

export const useAppStore = defineStore('canvas', () => {
  const { canvas } = useEditorServices()

  /** 当前激活的工具 */
  const activeTool = ref<EditTool>('move')

  // 监听activeTool
  watch(activeTool, (newValue, oldValue) => {
    // 移动工具关闭元素选中
    if (newValue === 'handMove') {
      canvas.skipTargetFind = true
      canvas.selection = false
    }
    if (oldValue === 'handMove') {
      canvas.skipTargetFind = false
      canvas.selection = true
    }
  })

  const { space } = useMagicKeys()

  nextTick(() => {
    // 鼠标中键拖动视窗
    let vpt = canvas.viewportTransform
    let lastTool: EditTool | undefined
    let mouseDown = false
    const { lengthX, lengthY, isSwiping } = useFabricSwipe({
      onSwipeStart: (e) => {
        // 判断isSwiping.value，修复双击中键卡在move工具上
        if (!isSwiping.value) return
        vpt = canvas.viewportTransform
        if (e.button === 2 && activeTool.value !== 'handMove') {
          lastTool = activeTool.value
          activeTool.value = 'handMove'
          canvas.setCursor('grabbing')
        }
        if (e.button === 1 && activeTool.value === 'handMove') {
          canvas.setCursor('grabbing')
        }
        mouseDown = true
      },
      onSwipe: () => {
        if (activeTool.value === 'handMove') {
          if (mouseDown) {
            canvas.setCursor('grabbing')
            const deltaPoint = new Point(lengthX.value, lengthY.value)
              .scalarDivide(canvas.getZoom())
              .transform(vpt)
              .scalarMultiply(-1)
            canvas.absolutePan(deltaPoint)
          } else {
            canvas.setCursor('grab')
          }
        }
      },
      onSwipeEnd: () => {
        if (lastTool) {
          if (!space.value) {
            activeTool.value = lastTool
          }
          canvas.setCursor(canvas.defaultCursor)
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
        canvas.defaultCursor = 'grab'
        canvas.setCursor(canvas.defaultCursor)
      } else if (_lastTool) {
        activeTool.value = _lastTool
        _lastTool = undefined
        canvas.defaultCursor = 'default'
        canvas.setCursor(canvas.defaultCursor)
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
    canvas.add(board1, board2)

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
    canvas.add(group)

    for (let index = 0; index < 3; index++) {
      canvas.add(
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
  const activeObject = computed(() => canvas.activeObject.value)

  const { objects } = canvas

  return {
    /** 画布 */
    // canvas,
    /** 当前选中的对象 */
    // activeObject,
    activeObject,
    /** 全部的对象 */
    objects,
    /** 当前激活的工具 */
    activeTool,
  }
})
