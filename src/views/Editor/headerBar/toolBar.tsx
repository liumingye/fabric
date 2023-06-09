import { useEditor } from '@/app'
import { Button } from '@arco-design/web-vue'
import { keybindMap } from '@/utils/constants'
import SvgIcon from '@/components/svgIcon'
import { Group, Board } from '@fabric'

export default defineComponent({
  setup() {
    const { canvas, keybinding } = useEditor()

    const GroupBtn = () => (
      <Button
        onClick={() => keybinding.trigger(keybindMap.group)}
        class='icon-btn'
        disabled={canvas.activeObject.value instanceof Board}
        v-slots={{
          icon: () => <SvgIcon name='object-group'></SvgIcon>,
        }}></Button>
    )

    const UnGroupBtn = () => (
      <Button
        onClick={() => keybinding.trigger(keybindMap.ungroup)}
        class='icon-btn'
        disabled={!(canvas.activeObject.value instanceof Group)}
        v-slots={{
          icon: () => <SvgIcon name='object-ungroup'></SvgIcon>,
        }}></Button>
    )

    return () => (
      <>
        {GroupBtn()}
        {UnGroupBtn()}
      </>
    )
  },
})
