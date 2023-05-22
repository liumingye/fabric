import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { Disposable } from '@/utils/lifecycle'
import MenuComponent from '@/components/contextMenu'
import { CanvasEvents } from '@fabric'
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

  private showBlankContextMenu(e: CanvasEvents['contextmenu']) {
    const event = e.e as MouseEvent
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
