import { worldBounds } from "./bounds"
import { ContextMenu, isContextMenuHovering } from "./render/contextmenu"
import { hitcheckSprites } from "./render/sprite"
import { mainViewport } from "./render/viewport"
import { Matrix } from "./utils/matrix"
import { Transform } from "./utils/transform"

/**
 * @typedef {Object} DragObject
 * @prop {import("./components/typedefs").GameObject} gameobject
 * @prop {number} offsetX
 * @prop {number} offsetY
 * @prop {number} mode
 */

export const Camera = {
	/** @type {DragObject?} */
	drag: null,
	world: {x: 0, y: 0},
	screen: {x: 0, y: 0},
	clickStart: {x: 0, y: 0},
	movedForDrag: false,
	wheelTarget: {
		x: 0, y: 0,
		target: null,
	}
}

/** @param {WheelEvent} e  */
function onWheel(e) {
	// Rotate object
	let hitResult = Camera.wheelTarget.target
	
	if (!hitResult) {
		const worldPoint = mainViewport.screenToWorld(e.x, e.y)
		hitResult = hitcheckSprites(worldPoint.x, worldPoint.y)
		Camera.wheelTarget.target = hitResult
		Camera.wheelTarget.x = e.x
		Camera.wheelTarget.y = e.y
	}

	if (hitResult && !hitResult.sprite.locked) {
		const transform = hitResult.sprite.meta.gameobject.transform
		transform.angle += Math.PI * e.deltaY / 1800
		Transform.updateTransform(transform)
		return
	}

	// zoom
	const scale = mainViewport.zoom - Math.sign(e.deltaY) / 10 * mainViewport.zoom
	mainViewport.zoom = Math.max(0.4, Math.min(4, scale))
	mainViewport.updateTransform()
}


/** @param {PointerEvent} e  */
function onPointerDown(e) {
	if (!isContextMenuHovering())
		ContextMenu.hide()

	Camera.clickStart.x = e.x
	Camera.clickStart.y = e.y
	Camera.movedForDrag = false

	// Grab object
	const worldPoint = mainViewport.screenToWorld(e.x, e.y)
	const hitResult = hitcheckSprites(worldPoint.x, worldPoint.y)
	if (e.button === 0 && hitResult && !hitResult.sprite.locked) {
		const transform = hitResult.sprite.meta.gameobject.transform
		Camera.drag = {
			gameobject: hitResult.sprite.meta.gameobject,
			offsetX: transform.x - worldPoint.x,
			offsetY: transform.y - worldPoint.y,
			mode: e.button
		}
		return
	}

	// Grab camera
	const world = Matrix.applyVec(Matrix.apply(Matrix.rotate(-mainViewport.angle), Matrix.scale(1/mainViewport.zoom, 1/mainViewport.zoom)), e.x, e.y)
	const fromCenterX = window.innerWidth / 2 - e.x
	const fromCenterY = window.innerHeight / 2 - e.y
	const angle = Math.atan2(fromCenterY, fromCenterX)
	Camera.drag = {
		offsetX: mainViewport.x - world.x,
		offsetY: mainViewport.y - world.y,
		offsetAngle: mainViewport.angle - angle,
		mode: e.button
	}
}

/** @param {PointerEvent} e  */
function onPointerMove(e) {
	Camera.screen.x = e.x
	Camera.screen.y = e.y
	Camera.world = mainViewport.screenToWorld(e.x, e.y)

	if (Camera.wheelTarget.target && Math.abs(Camera.wheelTarget.x - e.x) + Math.abs(Camera.wheelTarget.y - e.y) > 10)
		Camera.wheelTarget.target = null

	if (!Camera.drag)
		return

	Camera.movedForDrag = Camera.movedForDrag || 
		Math.abs(Camera.clickStart.x - e.x) + Math.abs(Camera.clickStart.y - e.y) > 10;

	if (!Camera.movedForDrag)
		return

	// Drag object
	if (Camera.drag.gameobject) {
		Camera.drag.gameobject.transform.x = Camera.world.x + Camera.drag.offsetX
		Camera.drag.gameobject.transform.y = Camera.world.y + Camera.drag.offsetY
		worldBounds.apply(Camera.drag.gameobject.transform)
		Transform.updateTransform(Camera.drag.gameobject.transform)
		return
	}

	// Drag World
	if (Camera.drag.mode === 0) {
		// Intentionally don't use position
		const world = Matrix.applyVec(
			Matrix.apply(
				Matrix.rotate(-mainViewport.angle), 
				Matrix.scale(1/mainViewport.zoom, 1/mainViewport.zoom)
			), 
			e.x, e.y
		)
		mainViewport.x = world.x + Camera.drag.offsetX
		mainViewport.y = world.y + Camera.drag.offsetY
		worldBounds.apply(mainViewport)
		mainViewport.updateTransform()
	} 

	// Rotate world
	if (Camera.drag.mode === 2) {
		const fromCenterX = window.innerWidth / 2 - e.x
		const fromCenterY = window.innerHeight / 2 - e.y
		const angle = Math.atan2(fromCenterY, fromCenterX)
		mainViewport.angle = Camera.drag.offsetAngle + angle
		mainViewport.updateTransform()
	}
}

/** @param {PointerEvent} e  */
function onPointerUp(e) {
	//console.log(Camera.drag?.gameobject?.transform);
	
	Camera.drag = null
}

/**@param {MouseEvent} e  */
function onClick(e) {
	if (ContextMenu.hovering)
		ContextMenu.hovering.onClick?.(e)
}

function onContextMenu(e) {
	e.preventDefault()
	if (Camera.movedForDrag)
		return
	const hitResult = hitcheckSprites(Camera.world.x, Camera.world.y)
	if (hitResult) {
		ContextMenu
			.new()
			.button(hitResult.sprite.locked ? "Unlock" : "Lock", () => {
				hitResult.sprite.locked = !hitResult.sprite.locked
				ContextMenu.hide()
			})
			.show(Camera.screen.x, Camera.screen.y)
		return
	}
	
	// TODO(Lumi): Open a context menu based on the object/context
	ContextMenu
		.new()
		.label("Context Menu!")
		.button("Flip", () => console.log("Flop")).hotkey("F")
		.button("Shuffle", () => console.log("SHUFFLE")).hotkey("S")
		.idLabel(3310)
		.show(Camera.screen.x, Camera.screen.y)
}

export function setupCamera() {
	window.addEventListener("wheel", onWheel)
	window.addEventListener("pointerdown", onPointerDown)
	window.addEventListener("contextmenu", onContextMenu)
	window.addEventListener("pointermove", onPointerMove)
	window.addEventListener("pointerup", onPointerUp)
	window.addEventListener("click", onClick)
}
