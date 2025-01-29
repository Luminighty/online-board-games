import { ContextMenuButton } from "./button"
import { ID_LABEL_FONT, LABEL_FONT, renderBaseBox } from "./common"
import { ContextMenuStyle } from "./styles"

export const MENU_TYPE = {
	Label: 1,
	Button: 2,
	idLabel: 3,
}

/** 
 * @typedef {Object} RenderingContext 
 * @prop {CanvasRenderingContext2D} context
 * @prop {number} cursorX
 * @prop {number} cursorY
 * @prop {number} x
 * @prop {number} y
 * @prop {number} lineHeight
 * @prop {number} width
 * @prop {number} padding.x
 * @prop {number} padding.y
 */

export const MenuRenderer = {
	/** @param {RenderingContext} render */
	[MENU_TYPE.Label]: (item, render) => {
		renderBaseBox(render)

		render.context.fillStyle = ContextMenuStyle.color
		render.context.font = LABEL_FONT
		render.context.fillText(item.label, render.x + render.padding.x, render.y + render.padding.y)

		render.y += render.lineHeight
	},
	/** @param {RenderingContext} render */
	[MENU_TYPE.idLabel]: (item, render) => {
		renderBaseBox(render, { height: 3 + render.padding.y * 2 })
		render.context.fillStyle = "darkgray"
		render.context.font = ID_LABEL_FONT
		render.context.fillText(`id: ${item.id}`, render.x + render.padding.x, render.y + 4)

		render.y += render.lineHeight
	}
}

