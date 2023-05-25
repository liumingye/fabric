import { isNumber, isString } from 'lodash'

/**
 * @param {Image|Imageable} target img: blob, canvas, context2d
 * @returns A Canvas.context object
 */
const toContext = async (
  target: Blob | HTMLCanvasElement,
): Promise<CanvasRenderingContext2D | null> => {
  if (target instanceof Blob) {
    const image = new Image()
    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject()
          return
        }
        canvas.width = image.width
        canvas.height = image.height
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(ctx)
      }
      image.onerror = () => {
        reject()
      }
      image.src = URL.createObjectURL(target)
    })
  } else if (target instanceof CanvasRenderingContext2D) {
    return target
  } else if (target instanceof HTMLCanvasElement) {
    return target.getContext('2d')
  }

  throw Error('toContext: bad img type')
}

/**
 * @param {*} msg A string, charCode (number), Uint8Array or Uint8ClampedArray
 * @returns A Uint8Array or Uint8ClampedArray
 */
const toUint8Array = (msg: string | number | Uint8Array | Uint8ClampedArray) => {
  if (msg instanceof Uint8Array || msg instanceof Uint8ClampedArray) {
    return msg
  } else if (isNumber(msg) || isString(msg)) {
    if (isNumber(msg)) {
      msg = String.fromCharCode(msg) // drop thru to 'string'
    }
    return new TextEncoder().encode(msg)
  }

  throw Error('toUint8Array: bad msg type')
}

// Convert a char to an array of three RGB low order pixel values
/**
 *
 * @param {} char An 8 bit char
 * @returns Array of 3 parts of char using the bits tempate (3, 2, 3 bits)
 */
const charToBits = (char: number) => {
  // return [char >> 5, char >> 3 & 0b11111100, char & 0b11111000]
  return [char >> bits[0].shift, (char >> bits[1].shift) & bits[1].msgMask, char & bits[2].msgMask]
}

const bits = [
  { shift: 5, msgMask: 0b00000111, dataMask: 0b11111000 }, // bits: 3
  { shift: 3, msgMask: 0b00000011, dataMask: 0b11111100 }, // bits: 2
  { shift: 0, msgMask: 0b00000111, dataMask: 0b11111000 }, // bits: 3
]

const checkSize = (msg: string | any[], width: number, height: number) => {
  const imgSize = width * height // 1 px = 1 byte
  if (imgSize < msg.length) throw Error(`encode: image size < msg.length: ${imgSize} ${msg.length}`)
}

// Return the character length of the message within the image's imgData
const stegMsgSize = (imgData: Uint8ClampedArray) => {
  for (let i = 3; i < imgData.length; i = i + 4) {
    if (imgData[i] === 254) return (i - 3) / 4
  }
  throw Error(`decode: no message terminator in image data, length = ${imgData.length}`)
}

// ============== encode/decode ==============

export async function encode(img: Blob | HTMLCanvasElement, msg: string) {
  try {
    const ctx = await toContext(img)
    if (!ctx) return
    const { width, height } = ctx.canvas
    checkSize(msg, width, height)

    const msgArray = toUint8Array(msg)

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    let ix
    msgArray.forEach((char: number, i: number) => {
      const [ch0, ch1, ch2] = charToBits(char)
      ix = i * 4
      data[ix] = (data[ix++] & bits[0].dataMask) + ch0
      data[ix] = (data[ix++] & bits[1].dataMask) + ch1
      data[ix] = (data[ix++] & bits[2].dataMask) + ch2
      data[ix] = 255
    })

    if (ix) {
      data[ix + 4] = 254 // use alpha to terminate message
    }

    ctx.putImageData(imageData, 0, 0)

    return ctx
  } catch (e) {
    return
  }
}

export async function decode<T extends boolean = false>(
  img: Blob | HTMLCanvasElement,
  returnU8?: T,
): Promise<(T extends true ? Uint8Array : string) | undefined> {
  try {
    const ctx = await toContext(img)
    if (!ctx) return
    const { width, height } = ctx.canvas
    const data = ctx.getImageData(0, 0, width, height).data
    const msgSize = stegMsgSize(data)

    const msgArray = new Uint8Array(msgSize)
    msgArray.forEach((char, i) => {
      let ix = i * 4
      const ch0 = (bits[0].msgMask & data[ix++]) << bits[0].shift
      const ch1 = (bits[1].msgMask & data[ix++]) << bits[1].shift
      const ch2 = (bits[2].msgMask & data[ix++]) << bits[2].shift
      msgArray[i] = ch0 + ch1 + ch2
    })

    if (returnU8) return msgArray as T extends true ? Uint8Array : never
    return new TextDecoder().decode(msgArray) as T extends true ? never : string
  } catch (e) {
    return
  }
}
