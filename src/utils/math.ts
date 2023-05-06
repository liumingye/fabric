/**
 * Clamps the given 'angle' between '-180' and '180'
 * @param angle
 * @returns The clamped angle
 */
const clampAngle = (angle: number) => {
  const normalizedAngle = ((angle % 360) + 360) % 360
  const clampedAngle = normalizedAngle > 180 ? normalizedAngle - 360 : normalizedAngle
  return clampedAngle
}

const toFixed = (v: number, digits = 2) => Number(v.toFixed(digits))

export { clampAngle, toFixed }
