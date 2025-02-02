const BASE = 2000

export const worldBounds = {
	minX: -BASE,
	minY: -BASE,
	maxX: BASE,
	maxY: BASE,
	width() { return this.maxX - this.minX},
	height() { return this.maxY - this.minY},
	
	clamp(x, y) {
		return {
			x: Math.max(this.minX, Math.min(this.maxX, x)),
			y: Math.max(this.minY, Math.min(this.maxY, y)),
		}
	},
	apply(object) {
		const clamped = this.clamp(object.x, object.y)
		object.x = clamped.x
		object.y = clamped.y
	}
}

