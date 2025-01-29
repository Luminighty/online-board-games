import { Matrix } from "./matrix"

/** 
 * @typedef {Object} TransformT
 * @prop {number} x
 * @prop {number} y
 * @prop {number} scaleX
 * @prop {number} scaleY
 * @prop {number} angle
 * @prop {TransformT} parent
 * @prop {import("./matrix").CanvasMatrix} transform
 * @prop {import("./matrix").CanvasMatrix} inverse
 */

export const Transform = {
	/** @returns {TransformT}  */
	new(options = {}) {
		const transform = {
			x: options.x ?? 0,
			y: options.y ?? 0,
			pivot: options.pivot ?? {x: 0, y: 0},
			scaleX: options.scaleX ?? 1,
			scaleY: options.scaleY ?? 1,
			angle: options.angle ?? 0,
			parent: options.parent ?? null,
			transform: Matrix.identity(),
			inverse: Matrix.identity(),
		}
		Transform.updateTransform(transform)
		return transform
	},
	clone(from) {
		const transform = {
			x: from.x,
			y: from.y,
			pivot: { ...from.pivot },
			scaleX: from.scaleX,
			scaleY: from.scaleY,
			angle: from.angle,
			parent: from.parent,
			transform: Matrix.identity(),
			inverse: Matrix.identity(),
		}
		Transform.updateTransform(transform)
		return transform
	},
	/** @param {TransformT} self  */
	updateTransform(self) {
		self.transform = Matrix.applyAll(
			Matrix.translate(self.x, self.y),
			Matrix.rotate(self.angle),
			Matrix.scale(self.scaleX, self.scaleY),
			Matrix.translate(-self.pivot.x, -self.pivot.y),
		)
		self.inverse = Matrix.applyAll(
			Matrix.translate(self.pivot.x, self.pivot.y),
			Matrix.scale(1/self.scaleX, 1/self.scaleY),
			Matrix.rotate(-self.angle),
			Matrix.translate(-self.x, -self.y),
		)
	},
	/** @param {TransformT} self  */
	globalTransform(self) {
		if (self.parent) {
			return Matrix.apply(
				Transform.globalTransform(self.parent),
				self.transform
			)
		} else {
			return self.transform
		}
	},
	/** @param {TransformT} self  */
	globalInverse(self) {
		if (self.parent) {
			return Matrix.apply(
				self.inverse,
				Transform.globalInverse(self.parent)
			)
		} else {
			return self.inverse
		}
	},
}