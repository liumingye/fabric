const textChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function randomText(randomLength = 10): string {
  let str = ''
  for (let i = 0; i < randomLength; i++) {
    str += textChars.charAt(Math.floor(Math.random() * textChars.length))
  }

  return str
}
