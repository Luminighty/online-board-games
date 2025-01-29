import { ContextMenuStyle } from "./styles"

export const BASE_FONT = `16px "arial"`
export const ID_LABEL_FONT = `italic 10px "arial"`
export const LABEL_FONT = `italic ${BASE_FONT}`

/** @param {RenderingContext} render */
export function renderBaseBox(render, options={}) {
	render.context.fillStyle = options.fillStyle ?? ContextMenuStyle.bg
	const height = options.height ?? render.lineHeight
	render.context.fillRect(render.x, render.y - 1, render.width, height)
}
