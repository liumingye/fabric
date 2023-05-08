const pathChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function randomText(randomLength = 10): string {
  let str = ''
  for (let i = 0; i < randomLength; i++) {
    str += pathChars.charAt(Math.floor(Math.random() * pathChars.length))
  }

  return str
}
