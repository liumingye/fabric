export function illegalState(name?: string): Error {
  if (name) {
    return new Error(`Illegal state: ${name}`)
  } else {
    return new Error('Illegal state')
  }
}
