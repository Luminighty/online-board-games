/**
 * @typedef {Object} CanvasMatrix
 * @prop {number} a
 * @prop {number} b
 * @prop {number} c
 * @prop {number} d
 * @prop {number} e
 * @prop {number} f
 */

export const Matrix = {
	/**
	 * @param {number} a 
	 * @param {number} b 
	 * @param {number} c 
	 * @param {number} d 
	 * @param {number} e 
	 * @param {number} f 
	 * @returns {CanvasMatrix}
	 */
	create(a=0, b=0, c=0, d=0, e=0, f=0) { return {a, b, c, d, e, f} },
	/** @returns {CanvasMatrix} */
	identity() { return Matrix.create(1, 0, 0, 1, 0, 0) },
	/** @returns {CanvasMatrix} */
	translate(x, y) { return {a: 1, b: 0, c: 0, d: 1, e: x, f: y} },
	/** @returns {CanvasMatrix} */
	scale(x, y) { return {a: x, b: 0, c: 0, d: y, e: 0, f: 0} },
	/** @returns {CanvasMatrix} */
	rotate(rad) { 
		const cos = Math.cos(rad)
		const sin = Math.sin(rad)
		return {a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 }
	},
	/** @param {CanvasMatrix} self @param {CanvasMatrix} other @returns {CanvasMatrix} */
	apply(self, other) {
		return {
			a: self.a * other.a + self.b * other.b,
			b: self.b * other.a + self.d * other.b,
			c: self.a * other.c + self.c * other.d,
			d: self.b * other.c + self.d * other.d,
			e: self.a * other.e + self.c * other.f + self.e,
			f: self.b * other.e + self.d * other.f + self.f,
		}
	},
	/** @param {CanvasMatrix} self @param {...CanvasMatrix} others @returns {CanvasMatrix} */
	applyAll(self, ...others) {
		let res = self
		for (const other of others)
			res = Matrix.apply(res, other)
		return res
	},
	/** 
	 * @param {CanvasMatrix} self 
	 * @param {number} x 
	 * @param {number} y
	 * @returns {{x: number, y: number}} */
	applyVec(self, x, y) {
		return {
			x: self.a * x + self.c * y + self.e,
			y: self.b * x + self.d * y + self.f,
		}
	}
}