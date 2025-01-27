import { Matrix } from "../utils/matrix"

export const mainViewport = createViewport()

mainViewport.x = 0
mainViewport.y = 0
mainViewport.updateTransform()

window.addEventListener("resize", (e) => {
	mainViewport.width = window.innerWidth
	mainViewport.height = window.innerHeight
	mainViewport.updateTransform()
})

export function createViewport() {
	return {
		x: 0, y: 0,
		angle: 0,
		zoom: 1, 
		width: window.innerWidth, 
		height: window.innerHeight,
		transform: Matrix.identity(),
		inverse: Matrix.identity(),

		updateTransform() {
			this.transform = Matrix.applyAll(
				Matrix.translate(this.width / 2, this.height / 2),
				Matrix.rotate(this.angle),
				Matrix.scale(this.zoom, this.zoom),
				//Matrix.translate(-this.width / 2, -this.height / 2),
				Matrix.translate(this.x, this.y),
			)
			this.inverse = Matrix.applyAll(
				Matrix.translate(-this.x, -this.y),
				//Matrix.translate(this.width / 2, this.height / 2),
				Matrix.scale(1/this.zoom, 1/this.zoom),
				Matrix.rotate(-this.angle),
				Matrix.translate(-this.width / 2, -this.height / 2),
			)
		},

		applyToContext(context) {
			context.transform(
				this.transform.a,
				this.transform.b,
				this.transform.c,
				this.transform.d,
				this.transform.e,
				this.transform.f,
			)
		},

		screenToWorld(x, y) {
			return Matrix.applyVec(this.inverse, x, y)
		},
	}
}