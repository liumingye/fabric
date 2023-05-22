declare module 'app' {
  export type AlignMethod =
    | 'alignLeft'
    | 'alignRight'
    | 'alignCenter'
    | 'verticalTop'
    | 'verticalMiddle'
    | 'verticalBottom'
  export type EditTool = 'move' | 'handMove' | 'rect' | 'ellipse' | 'triangle' | 'star' | 'text'
}
