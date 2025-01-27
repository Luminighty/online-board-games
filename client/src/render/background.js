import { worldBounds } from "../bounds"

const MARGINX = 1000
const MARGINY = 1000

const backgroundCanvas = new OffscreenCanvas(
	worldBounds.width() + MARGINX * 2, 
	worldBounds.height() + MARGINY * 2
)
const backgroundContext = backgroundCanvas.getContext("2d")

let image = new Image()
image.onload = onImageLoaded

function onImageLoaded() {
	if (image.height < 1 || image.width < 1)
		return
	for (let y = 0; y < backgroundCanvas.height; y += image.height) {
		for (let x = 0; x < backgroundCanvas.width; x += image.width) {
			backgroundContext.drawImage(image, x, y)
		}
	}
}

export function setBackground(src) {
	image.src = src
}

/** @param {CanvasRenderingContext2D} context  */
export function drawBackground(context) {
	// TODO(Lumi) Maybe I could only draw the part of the screen that's actually visible
	context.drawImage(backgroundCanvas, worldBounds.minX - MARGINX, worldBounds.minY - MARGINY)
}