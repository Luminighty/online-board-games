export const BASE_FONT = `16px "arial"`
export const ID_LABEL_FONT = `italic 12px "arial"`
export const LABEL_FONT = `italic ${BASE_FONT}`

/** @param {RenderingContext} render */
export function renderBaseBox(render, options={}) {
	render.context.fillStyle = options.fillStyle ?? "white"
	render.context.strokeStyle = "black"
	const height = options.height ?? render.lineHeight
	render.context.fillRect(render.x, render.y - 1, render.width, height)
}
