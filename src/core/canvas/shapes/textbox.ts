import { Textbox as TextboxOrigin } from 'fabric'
import { classRegistry } from '@fabric'
import { createTextboxDefaultControls } from '@/core/canvas/controls/commonControls'

export class Textbox extends TextboxOrigin {
  declare _styleMap: object

  static getDefaults() {
    return {
      ...super.getDefaults(),
      controls: createTextboxDefaultControls() as any,
      ...Textbox.ownDefaults,
    }
  }

  constructor(text: string, options: object) {
    super(text, options)

    this.on('scaling', () => {
      const { y: height, x: width } = this._getTransformedDimensions()
      this.set({
        width,
        height: Math.max(height, 1),
        scaleX: 1,
        scaleY: 1,
      })
    })
  }

  override initDimensions() {
    if (!this.initialized) {
      return
    }
    this.isEditing && this.initDelayedCursor()
    this._clearCache()
    // clear dynamicMinWidth as it will be different after we re-wrap line
    this.dynamicMinWidth = 0
    // wrap lines
    this._styleMap = this._generateStyleMap(this._splitText())
    // if after wrapping, the width is smaller than dynamicMinWidth, change the width and re-wrap
    if (this.dynamicMinWidth > this.width) {
      this._set('width', this.dynamicMinWidth)
    }
    if (this.textAlign.indexOf('justify') !== -1) {
      // once text is measured we need to make space fatter to make justified text.
      this.enlargeSpaces()
    }
  }
}

classRegistry.setClass(Textbox)
