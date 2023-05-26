const textChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

/**
 * Generates a string containing random characters.
 * @param {number} [randomLength=10] - Length of the generated string. Default is 10.
 * @returns {string} - The generated string.
 */
export function randomText(randomLength = 10): string {
  let str = ''
  for (let i = 0; i < randomLength; i++) {
    str += textChars.charAt(Math.floor(Math.random() * textChars.length))
  }

  return str
}
