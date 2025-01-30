import { Camera } from "../../camera"
import { Matrix } from "../../utils/matrix"
import { Transform } from "../../utils/transform"
import { Animation } from "../animator"
import { applyMatrixToContext } from "../sprite"
import { ContextMenuButton } from "./button"
import { BASE_FONT, ID_LABEL_FONT, LABEL_FONT } from "./common"
import { ContextMenuStyle } from "./styles"
import { MENU_TYPE, MenuRenderer } from "./types"


export const ContextMenu = {
	visible: false,
	items: [],
	height: 0,
	transform: Transform.new(),
	padding: {l: 10, r: 30, y: 10},
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

	keepOpen() {
		this.items[this.items.length - 1].keepOpen = true
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
		this.transform.x = x
		this.transform.y = y
		Transform.updateTransform(this.transform)
		Animation.create()
			.transform(this.transform, "scaleX", [0, 0], [60, 1])
			.transform(this.transform, "scaleY", [0, 0], [60, 1])
			.play()
	},

	hide() {
		this.visible = false
		this.hovering = null
		document.body.style.cursor = "default"
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
	return max + ContextMenu.padding.l + ContextMenu.padding.r
}

/** @param {CanvasRenderingContext2D} context  */
export function renderContextMenu(context, cursorX, cursorY) {
	if (!ContextMenu.visible)
		return
	context.save()
	applyMatrixToContext(context, ContextMenu.transform.transform)
	let x = 0
	let y = 0
	const cursor = Matrix.applyVec(ContextMenu.transform.inverse, cursorX, cursorY)
	cursorX = cursor.x
	cursorY = cursor.y

	context.fillStyle = ContextMenuStyle.bg
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

	ContextMenu.height = renderingContext.y
	ContextMenu.hovering = renderingContext.hovering
	document.body.style.cursor = renderingContext.cursor ?? "default"
	context.restore()
}

export function isContextMenuHovering() {
	if (!ContextMenu.visible)
		return false
	const cursor = Matrix.applyVec(ContextMenu.transform.inverse, Camera.screen.x, Camera.screen.y)
	console.log({...cursor, w: ContextMenu.width, h: ContextMenu.height});
	return cursor.x >= 0 && cursor.x <= ContextMenu.width && 
		cursor.y >= 0 && cursor.y <= ContextMenu.height
}