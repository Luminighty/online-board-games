/** @type {HTMLCanvasElement} */
let canvasElement
/** @type {CanvasRenderingContext2D} */
let context

export function setupCanvas(selector) {
	canvasElement = document.body.querySelector(selector)
	context = canvasElement.getContext("2d", {
		antialias: true,
	})

	window.addEventListener("resize", resizeCanvas)
	resizeCanvas()
}

export function resizeCanvas() {
	canvasElement.width = window.innerWidth
	canvasElement.height = window.innerHeight
}

export function clearScreen() {
	context.fillRect(0, 0, )
}

export function getContext() {
	return context
}