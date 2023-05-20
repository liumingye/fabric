import NP from 'number-precision'

/**
 * Clamps the given 'angle' between '-180' and '180'
 * @param angle
 * @returns The clamped angle
 */
export const clampAngle = (angle: number): number => {
  const normalizedAngle = ((angle % 360) + 360) % 360
  const clampedAngle = normalizedAngle > 180 ? normalizedAngle - 360 : normalizedAngle
  return clampedAngle
}

export const toFixed = (v: number, digits = 2): number => NP.round(v, digits)
