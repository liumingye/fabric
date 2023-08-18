import { createEditorPlugin } from '@/core'
import { IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IEditorUndoRedoService } from '@/app/editor/undoRedo/undoRedoService'
import { Board, Gradient, Group, Rect, util, Pattern, Triangle } from '@fabric'
import { random } from 'lodash'
import TestSlot from './testSlot.vue'

const myPlugin = createEditorPlugin((editor) => {
  const [canvas, undoRedo] = editor.service.invokeFunction((accessor) => {
    return [accessor.get(IFabricCanvas), accessor.get(IEditorUndoRedoService)]
  })
  return {
    setup() {
      // console.log('myPlugin setup')
      // console.log(editor)
      // function getRandomColor() {
      //   return '#' + Math.random().toString(16).substring(2, 8)
      // }
      //
      // const board1 = new Board([], {
      //   top: 50,
      //   left: 50,
      //   width: 300,
      //   height: 300,
      // })
      // const board2 = new Board([], {
      //   top: 400,
      //   left: 50,
      //   width: 800,
      //   height: 800,
      //   fill: '#f2b8ca',
      //   name: '画板 1000个元素',
      // })
      //
      // const group = new Group(
      //   [
      //     new Rect({
      //       top: random(400, 500),
      //       left: random(300, 400),
      //       width: random(50, 100),
      //       height: random(50, 100),
      //       fill: getRandomColor(),
      //       strokeWidth: random(0, 10),
      //       stroke: getRandomColor(),
      //     }),
      //     new Rect({
      //       top: random(400, 500),
      //       left: random(400, 500),
      //       width: random(50, 100),
      //       height: random(50, 100),
      //       fill: getRandomColor(),
      //       strokeWidth: random(0, 10),
      //       stroke: getRandomColor(),
      //     }),
      //   ],
      //   {
      //     // subTargetCheck: true,
      //     // interactive: true,
      //   },
      // )
      // canvas.add(group)
      //
      // const rects = []
      //
      // const shape = new Triangle({
      //   top: 10,
      //   left: 10,
      //   width: 200,
      //   height: 200,
      //   fill: '',
      // })
      // canvas.add(shape)
      // util
      //   .loadImage(
      //     'https://img.js.design/assets/img/6486fff21a74fef8078bf782.jpg#4d6a3f65b147c75a22effca8347bc5ce',
      //     {
      //       crossOrigin: 'anonymous',
      //     },
      //   )
      //   .then((image) => {
      //     shape.fill = new Pattern({
      //       crossOrigin: 'anonymous',
      //       source: image,
      //       fit: 'fill',
      //     })
      //     shape.set('dirty', true)
      //     canvas.requestRenderAll()
      //   })
      //
      // for (let index = 0; index < 50; index++) {
      //   rects.push(
      //     new Rect({
      //       top: random(100, 300),
      //       left: random(400, 800),
      //       width: random(50, 100),
      //       height: random(50, 100),
      //       fill: new Gradient({
      //         type: 'linear',
      //         coords: { x1: 0, y1: 0, x2: 100, y2: 100 },
      //         colorStops: [
      //           {
      //             color: getRandomColor(),
      //             offset: 0,
      //           },
      //           {
      //             color: getRandomColor(),
      //             offset: 1,
      //           },
      //         ],
      //       }),
      //     }),
      //   )
      // }
      //
      // for (let index = 0; index < 1000; index++) {
      //   board2.add(
      //     new Rect({
      //       top: random(400, 1100),
      //       left: random(50, 750),
      //       width: random(50, 100),
      //       height: random(50, 100),
      //       fill: getRandomColor(),
      //       // strokeWidth: random(0, 10),
      //       // stroke: getRandomColor(),
      //     }),
      //   )
      // }
      // canvas.add(...rects)
      // canvas.add(board1, board2)
      //
      // undoRedo.saveState()
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
