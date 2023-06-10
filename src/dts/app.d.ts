declare module 'app' {
  /** 对齐方法 */
  export type AlignMethod =
    | 'alignLeft'
    | 'alignRight'
    | 'alignCenter'
    | 'verticalTop'
    | 'verticalMiddle'
    | 'verticalBottom'

  /** 编辑工具 */
  export type EditTool =
    | 'move'
    | 'handMove'
    | 'board'
    | 'rect'
    | 'ellipse'
    | 'triangle'
    | 'star'
    | 'text'
    | 'vector'
    | 'pencil'
}
