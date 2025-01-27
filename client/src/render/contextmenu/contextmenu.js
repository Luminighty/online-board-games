import { Camera } from "../../camera"
import { ContextMenuButton } from "./button"
import { BASE_FONT, ID_LABEL_FONT, LABEL_FONT } from "./common"
import { MENU_TYPE, MenuRenderer } from "./types"


export const ContextMenu = {
	visible: false,
	items: [],
	height: 0,
	x: 0,
	y: 0,
	padding: {x: 8, y: 10},
	width: 100,
	height: 0,
	hovering: null,
	isDirty: true,

	new() { 
		this.items.length = 0 
		this.height = 0
		this.isDirty = true
		return this
	},

	label(label) {
		this.items.push({
			type: MENU_TYPE.Label,
			label,
			width(context) {
				context.font = LABEL_FONT
				return context.measureText(this.label).width
			}
		})
		return this
	},

	button(label, onClick) {
		this.items.push(ContextMenuButton(label, onClick))
		return this
	},

	hotkey(label) {
		this.items[this.items.length - 1].hotkey = label
		return this
	},

	idLabel(id) {
		this.items.push({ 
			type: MENU_TYPE.idLabel, 
			id,
			width(context) {
				context.font = ID_LABEL_FONT
				return context.measureText(`Id: ${this.id}`).width
			}
		})
		return this
	},

	show(x, y) {
		this.visible = true
		this.x = x
		this.y = y
	},

	hide() {
		this.visible = false
		this.hovering = null
	},
}

/** @param {CanvasRenderingContext2D} context  */
function calculateMaxWidth(context) {
	let max = 0
	for (const item of ContextMenu.items) {
		let w = context.measureText(item.label).width
		if (w > max)
			max = w
	}
	return max + ContextMenu.padding.x * 2
}

/** @param {CanvasRenderingContext2D} context  */
export function renderContextMenu(context, cursorX, cursorY) {
	if (!ContextMenu.visible)
		return

	let x = ContextMenu.x
	let y = ContextMenu.y
	context.fillStyle = "black"
	context.textBaseline = "top"
	context.font = BASE_FONT
	const lineHeight = ContextMenu.padding.y * 2 + 16

	if (ContextMenu.isDirty) {
		ContextMenu.width = calculateMaxWidth(context)
		ContextMenu.isDirty = false
	}

	const renderingContext = { 
		context, 
		cursorX, cursorY, x, y, 
		lineHeight, width: ContextMenu.width,
		padding: ContextMenu.padding,
		hovering: null, 
	}
	for (const item of ContextMenu.items)
		MenuRenderer[item.type](item, renderingContext)

	ContextMenu.height = renderingContext.y - ContextMenu.y
	ContextMenu.hovering = renderingContext.hovering
	document.body.style.cursor = renderingContext.cursor ?? "default"
}

export function isContextMenuHovering() {
	return Camera.screen.x >= ContextMenu.x && Camera.screen.x <= ContextMenu.x + ContextMenu.width && 
		Camera.screen.y >= ContextMenu.y && Camera.screen.y <= ContextMenu.y + ContextMenu.height
}