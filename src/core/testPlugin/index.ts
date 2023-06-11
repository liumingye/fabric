import { createEditorPlugin } from '@/core'
import { IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IUndoRedoService } from '@/app/editor/undoRedo/undoRedoService'
import { Board, Gradient, Group, Rect } from '@fabric'
import { random } from 'lodash'
import TestSlot from './testSlot.vue'

const myPlugin = createEditorPlugin((editor) => {
  const [canvas, undoRedo] = editor.service.invokeFunction((accessor) => {
    return [accessor.get(IFabricCanvas), accessor.get(IUndoRedoService)]
  })
  return {
    setup() {
      console.log('myPlugin setup')
      console.log(editor)
      function getRandomColor() {
        return '#' + Math.random().toString(16).substring(2, 8)
      }

      const board1 = new Board([], {
        top: 50,
        left: 50,
        width: 300,
        height: 300,
      })
      const board2 = new Board([], {
        top: 400,
        left: 50,
        width: 300,
        height: 300,
        fill: '#f2b8ca',
      })
      canvas.add(board1, board2)
      // canvas.add(board2)

      const group = new Group(
        [
          new Rect({
            top: random(400, 500),
            left: random(300, 400),
            width: random(50, 100),
            height: random(50, 100),
            fill: getRandomColor(),
            strokeWidth: random(0, 10),
            stroke: getRandomColor(),
          }),
          new Rect({
            top: random(400, 500),
            left: random(400, 500),
            width: random(50, 100),
            height: random(50, 100),
            fill: getRandomColor(),
            strokeWidth: random(0, 10),
            stroke: getRandomColor(),
          }),
        ],
        {
          // subTargetCheck: true,
          // interactive: true,
        },
      )
      canvas.add(group)

      const rects = []

      for (let index = 0; index < 50; index++) {
        rects.push(
          new Rect({
            top: random(100, 500),
            left: random(400, 800),
            width: random(50, 100),
            height: random(50, 100),
            fill: getRandomColor(),
            // strokeWidth: random(0, 10),
            // stroke:getRandomColor(),
            // globalCompositeOperation: 'luminosity',
          }),
        )

        // board1.add(
        //   new Rect({
        //     top: random(0, 200),
        //     left: random(0, 200),
        //     width: random(50, 100),
        //     height: random(50, 100),
        //     fill: new Gradient({
        //       type: 'radial',
        //       coords: { x1: 50, y1: 50, r1: 0, x2: 50, y2: 50, r2: 50 },
        //       colorStops: [
        //         { color: '#000000', offset: 0 },
        //         { color: '#ffffff', offset: 1 },
        //       ],
        //     }),
        //     strokeWidth: random(0, 10),
        //     stroke:getRandomColor(),
        //   }),
        // )
        board2.add(
          new Rect({
            top: random(400, 500),
            left: random(50, 200),
            width: random(50, 100),
            height: random(50, 100),
            fill: new Gradient({
              type: 'linear',
              coords: { x1: 0, y1: 0, x2: 100, y2: 100 },
              colorStops: [
                {
                  color: getRandomColor(),
                  offset: 0,
                },
                {
                  color: getRandomColor(),
                  offset: 1,
                },
              ],
            }),
            strokeWidth: random(0, 10),
            stroke: getRandomColor(),
          }),
        )
      }
      canvas.add(...rects)

      undoRedo.saveState()
    },
    dispose() {
      console.log('myPlugin dispose')
    },
    slots: {
      rightPanel: [TestSlot],
    },
  }
})

export { myPlugin }
