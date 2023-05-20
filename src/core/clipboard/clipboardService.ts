import { createDecorator } from '@/core/instantiation/instantiation'
import { registerSingleton } from '@/core/instantiation/extensions'

export const IClipboardService = createDecorator<ClipboardService>('clipboardService')

export class ClipboardService {
  //
}

registerSingleton(IClipboardService, ClipboardService)
