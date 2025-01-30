import { getContext } from "./canvas"

export function renderDebug(dt) {
	const context = getContext()
	context.fillStyle = "white"
	context.fillText(`FPS: ${Math.round(1000 / dt)}`, 10, 10)
}