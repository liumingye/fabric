import { createDecorator } from '@/core/instantiation/instantiation'
import { registerSingleton } from '@/core/instantiation/extensions'

export const IClipboardService = createDecorator<ClipboardService>('clipboardService')

export class ClipboardService {
  declare readonly _serviceBrand: undefined

  // constructor() {
  //   // test code
  //   setTimeout(() => {
  //     this.readBlob().then((res) => {
  //       console.log(res)
  //     })
  //   }, 500)
  // }

  private memoryBlob: Blob | undefined

  private async readMemoryBlob(): Promise<Blob | undefined> {
    return this.memoryBlob
  }

  private async writeMemoryBlob(blob: Blob): Promise<void> {
    this.memoryBlob = blob
  }

  public async writeBlob(blob: Blob): Promise<void> {
    try {
      return await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
    } catch (error) {
      console.error(error)
    }

    // 写入内存
    await this.writeMemoryBlob(blob)
  }

  public async readBlob(): Promise<Blob | undefined> {
    try {
      const clipboardItems = await navigator.clipboard.read()
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          const blob = await clipboardItem.getType(type)
          return blob
        }
      }
    } catch (error) {
      console.error(error)
    }

    // 读取内存
    return await this.readMemoryBlob()
  }

  async writeText(text: string): Promise<void> {
    // Guard access to navigator.clipboard with try/catch
    // as we have seen DOMExceptions in certain browsers
    // due to security policies.
    try {
      return await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error(error)
    }

    // Fallback to textarea and execCommand solution

    const activeElement = document.activeElement

    const textnode = document.createElement('textarea')
    textnode.setAttribute('aria-hidden', 'true')
    const textArea: HTMLTextAreaElement = document.body.appendChild(textnode)
    textArea.style.height = '1px'
    textArea.style.width = '1px'
    textArea.style.position = 'absolute'

    textArea.value = text
    textArea.focus()
    textArea.select()

    document.execCommand('copy')

    if (activeElement instanceof HTMLElement) {
      activeElement.focus()
    }

    document.body.removeChild(textArea)

    return
  }

  async readText(): Promise<string> {
    try {
      return await navigator.clipboard.readText()
    } catch (error) {
      console.error(error)
      return ''
    }
  }
}

registerSingleton(IClipboardService, ClipboardService)
