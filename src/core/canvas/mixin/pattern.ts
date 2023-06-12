import { Pattern } from 'fabric'

const toObjectOrigin = Pattern.prototype.toObject

Pattern.prototype.toObject = function (propertiesToInclude: string[] = []) {
  propertiesToInclude.push('fit')
  return toObjectOrigin.call(this, propertiesToInclude)
}

Pattern.prototype.fit = 'fill'
