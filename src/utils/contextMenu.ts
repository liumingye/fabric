import { useEditor } from '@/app'
import { ActiveSelection, Group } from '@fabric'

export const layerItems = () => {
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
      onClick: () => {
        keybinding.trigger('mod+g')
      },
      shortcut: `${mod} G`,
    },
    {
      label: '解除分组',
      hidden: !(canvas.getActiveObject() instanceof Group),
      onClick: () => {
        keybinding.trigger('mod+shift+g')
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
    },
  ]
}

export const zoomItems = () => {
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
