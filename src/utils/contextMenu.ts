import { useEditor } from '@/app'

export const layerItems = ({ isCollection }: { isCollection: boolean }) => {
  const { keybinding } = useEditor()
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
      hidden: !isCollection,
      onClick: () => {
        keybinding.trigger('mod+shift+g')
      },
      shortcut: `${mod} ⇧ G`,
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
