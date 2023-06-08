import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { Disposable } from '@/utils/lifecycle'
import MenuComponent from '@/components/contextMenu'
import { CanvasEvents, Point } from '@fabric'
import { layerItems, zoomItems } from '@/utils/contextMenu'
import { IKeybindingService, KeybindingService } from '@/core/keybinding/keybindingService'

export class ContextMenu extends Disposable {
  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService private readonly keybindingService: KeybindingService,
  ) {
    super()
    canvas.on('contextmenu', this.showLayerContextMenu.bind(this))
  }

  public pointer: Point | undefined

  private showBlankContextMenu(e: CanvasEvents['contextmenu']) {
    const event = e.e as MouseEvent
    this.pointer = this.canvas.getPointer(event)
    const { mod } = this.keybindingService
    MenuComponent.showContextMenu({
      x: event.clientX,
      y: event.clientY,
      preserveIconWidth: false,
      items: [
        {
          label: '选择全部',
          onClick: () => {
            this.keybindingService.trigger('mod+a')
          },
          shortcut: `${mod} A`,
        },
        {
          label: '粘贴到当前位置',
          onClick: () => {
            this.keybindingService.trigger('mod+shift+v')
          },
          shortcut: `${mod} ⇧ V`,
        },
        ...zoomItems(),
      ],
    })
  }

  private showLayerContextMenu(e: CanvasEvents['contextmenu']) {
    if (e.target) {
      this.canvas.setActiveObject(e.target)
    }

    const object = e.target || this.canvas.getActiveObject()

    if (!object) {
      this.showBlankContextMenu(e)
      return
    }

    const event = e.e as MouseEvent
    MenuComponent.showContextMenu({
      x: event.clientX,
      y: event.clientY,
      preserveIconWidth: false,
      items: layerItems(),
    })

    this.canvas.requestRenderAll()
  }
}
