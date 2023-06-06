import { FabricCanvas, IFabricCanvas } from '@/core/canvas/fabricCanvas'
import { IKeybindingService, KeybindingService } from '@/core/keybinding/keybindingService'
import { useAppStore } from '@/store'
import { Disposable } from '@/utils/lifecycle'
import { Group, Point, iMatrix } from '@fabric'

export class Zoom extends Disposable {
  private scalePadding = 0.9

  constructor(
    @IFabricCanvas private readonly canvas: FabricCanvas,
    @IKeybindingService readonly keybindingService: KeybindingService,
  ) {
    super()
    keybindingService.bind('+', () => {
      let zoom = canvas.getZoom()
      zoom = zoom < 1 && zoom * 2 > 1 ? 1 : zoom * 2
      this.zoomToPoint(zoom)
    })

    keybindingService.bind('-', () => {
      let zoom = canvas.getZoom()
      zoom = zoom > 1 && zoom / 2 < 1 ? 1 : zoom / 2
      this.zoomToPoint(zoom)
    })

    // 100%
    keybindingService.bind('mod+0', () => {
      this.zoomToPoint(1)
      return false
    })

    keybindingService.bind('mod+1', () => {
      this.showAllContent()
      return false
    })

    keybindingService.bind('mod+2', () => {
      this.showSelectedContent()
      return false
    })

    const { zoom } = storeToRefs(useAppStore())

    watchEffect(() => {
      zoom.value = canvas.ref.zoom.value
    })
  }

  public zoomToPoint(zoom: number) {
    this.canvas.zoomToPoint(this.canvas.getCenterPoint(), zoom)
  }

  /**
   * 显示全部
   */
  public showAllContent() {
    const objects = this.canvas.getObjects()
    if (objects.length === 0) {
      this.canvas.setViewportTransform(iMatrix)
      return
    }
    const boundingBox = Group.prototype.getObjectsBoundingBox(objects)
    if (!boundingBox) return
    const zoom =
      Math.min(
        this.canvas.getWidth() / boundingBox.width,
        this.canvas.getHeight() / boundingBox.height,
      ) * this.scalePadding
    this.canvas.setZoom(zoom)
    this.canvas.absolutePan(
      new Point(boundingBox.centerX, boundingBox.centerY)
        .scalarMultiply(zoom)
        .subtract(this.canvas.getCenterPoint()),
    )
  }

  /**
   * 显示选中内容
   */
  public showSelectedContent() {
    const objects = this.canvas.getActiveObject()
    if (!objects) return
    const zoom =
      Math.min(
        this.canvas.getWidth() / objects.getWidth(),
        this.canvas.getHeight() / objects.getHeight(),
      ) * this.scalePadding
    this.canvas.setZoom(zoom)
    this.canvas.absolutePan(
      objects.getCenterPoint().scalarMultiply(zoom).subtract(this.canvas.getCenterPoint()),
    )
  }
}
