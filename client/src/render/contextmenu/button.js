import { BASE_FONT, LABEL_FONT, renderBaseBox } from "./common"
import { ContextMenuStyle } from "./styles"
import { MENU_TYPE, MenuRenderer } from "./types"

/** 
 * @typedef {Object} CtxMenuButton
 * @prop {Function} onClick
 * @prop {string} label
 */

/** @returns {CtxMenuButton} */
export function ContextMenuButton(label, onClick) {
	return {
		type: MENU_TYPE.Button,
		label,
		onClick,
		keepOpen: false,
		/** @param {CanvasRenderingContext2D} context */
		width(context) {
			context.font = BASE_FONT
			let w = context.measureText(this.label).width
			if (this.hotkey)
				w += context.measureText(this.hotkey).width + 30
			return r
		}
	}
}

ContextMenuButton.hovering = (render) => 
	render.cursorX >= render.x &&
 	render.cursorY >= render.y &&
	render.cursorX < render.x + render.width && 
	render.cursorY < render.y + render.lineHeight

/** 
 * @param {CtxMenuButton} item
 * @param {RenderingContext} rendering  
 */
MenuRenderer[MENU_TYPE.Button] = (item, render) => {
	const hovering = ContextMenuButton.hovering(render)
	const fillStyle = hovering ? ContextMenuStyle.bgHover : ContextMenuStyle.bg
	if (hovering) {
		render.cursor = "pointer"
		render.hovering = item
	}
	renderBaseBox(render, {fillStyle})

	render.context.fillStyle = "white"
	render.context.font = BASE_FONT
	render.context.fillText(item.label, render.x + render.padding.x, render.y + render.padding.y)

	if (item.hotkey) {
		render.context.textAlign = "right"
		render.context.font = LABEL_FONT
		render.context.fillText(item.hotkey, render.x + render.width - render.padding.x, render.y + render.padding.y)
		render.context.textAlign = "left"
	}

	render.y += render.lineHeight
}

