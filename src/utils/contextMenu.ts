import { getActiveCore } from '@/core'
import { useEditor } from '@/app'
import { keybindMap } from '@/utils/constants'
import { ActiveSelection, Board, Group } from '@fabric'
import type { MenuItem } from '@/components/contextMenu/ContextMenuDefine'
import { IClipboardService } from '@/core/clipboard/clipboardService'

export const layerItems = (): MenuItem[] => {
  const { canvas, keybinding } = useEditor()
  const { mod } = keybinding
  return [
    {
      label: '向上移动一层',
      onClick: () => {
        keybinding.trigger('mod+]')
      },
      shortcut: `${mod} ]`,
    },
    {
      label: '移到顶层',
      onClick: () => {
        keybinding.trigger(']')
      },
      shortcut: ']',
    },
    {
      label: '向下移动一层',
      onClick: () => {
        keybinding.trigger('mod+[')
      },
      shortcut: `${mod} [`,
    },
    {
      label: '移到底层',
      onClick: () => {
        keybinding.trigger('[')
      },
      shortcut: '[',
      divided: true,
    },
    {
      label: '创建分组',
      hidden: canvas.getActiveObject() instanceof Board,
      onClick: () => {
        keybinding.trigger(keybindMap.group)
      },
      shortcut: `${mod} G`,
    },
    {
      label: '解除分组',
      hidden: !(canvas.getActiveObject() instanceof Group),
      onClick: () => {
        keybinding.trigger(keybindMap.ungroup)
      },
      shortcut: `${mod} ⇧ G`,
    },
    {
      label: '重命名',
      hidden: canvas.getActiveObject() instanceof ActiveSelection,
      onClick: () => {
        keybinding.trigger('mod+r')
      },
      shortcut: `${mod} R`,
      divided: true,
    },
    {
      label: '显示/隐藏',
      onClick: () => {
        keybinding.trigger('mod+shift+h')
      },
      shortcut: `${mod} ⇧ H`,
    },
    {
      label: '锁定/解锁',
      onClick: () => {
        keybinding.trigger('mod+shift+l')
      },
      shortcut: `${mod} ⇧ L`,
      // divided: true,
    },
    // {
    //   label: '复制/粘贴',
    //   children: [
    //     {
    //       label: '复制SVG代码',
    //       onClick: () => {
    //         getActiveCore().service.invokeFunction((accessor) => {
    //           if (!isDefined(canvas.activeObject)) return
    //           const bounding = canvas.activeObject.value.getBoundingRect()
    //           const markup = []
    //           const viewBox = `viewBox="${bounding.left} ${bounding.top} ${bounding.width} ${bounding.height}" `
    //           markup.push(
    //             '<svg ',
    //             'xmlns="http://www.w3.org/2000/svg" ',
    //             'xmlns:xlink="http://www.w3.org/1999/xlink" ',
    //             'version="1.1" ',
    //             'width="',
    //             canvas.activeObject.value.width,
    //             '" ',
    //             'height="',
    //             canvas.activeObject.value.height,
    //             '" ',
    //             viewBox,
    //             'xml:space="preserve">\n',
    //           )
    //           const svg = canvas.activeObject.value.toSVG()
    //           markup.push(svg, '</svg>')
    //           accessor.get(IClipboardService).writeText(markup.join(''))
    //         })
    //       },
    //     },
    //     // { label: '复制PNG图片' },
    //   ],
    // },
  ]
}

export const zoomItems = (): MenuItem[] => {
  const { keybinding } = useEditor()
  return [
    {
      label: '放大',
      onClick: () => {
        keybinding.trigger('+')
      },
      shortcut: `+`,
    },
    {
      label: '缩小',
      onClick: () => {
        keybinding.trigger('-')
      },
      shortcut: `-`,
    },
  ]
}
