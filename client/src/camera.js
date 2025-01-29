import { worldBounds } from "./bounds"
import { Flippable } from "./components/flip"
import { Roll } from "./components/roll"
import { Stack } from "./components/stack"
import { ContextMenu, isContextMenuHovering } from "./render/contextmenu"
import { SpriteEffect } from "./render/effects"
import { addToHand } from "./render/hand"
import { bringToFront, hitcheckSprites, hitcheckSpritesAll } from "./render/sprite"
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
	stack: {
		isDrawing: false,
		timeout: null,
	},
	wheelTarget: {
		x: 0, y: 0,
		target: null,
	}
}

/** @param {WheelEvent} e  */
export function onWheel(e) {
	// Rotate object
	let hitResult = Camera.drag?.gameobject ?? Camera.wheelTarget.target
	let locked = hitResult?.locked ?? false
	if (!hitResult) {
		const worldPoint = mainViewport.screenToWorld(e.x, e.y)
		hitResult = hitcheckSprites(worldPoint.x, worldPoint.y)
		locked = hitResult?.sprite.meta.gameobject?.locked ?? false
		Camera.wheelTarget.target = hitResult?.sprite?.meta?.gameobject
		Camera.wheelTarget.x = e.x
		Camera.wheelTarget.y = e.y
	}

	if (hitResult && !locked) {
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
export function onPointerDown(e) {
	if (isContextMenuHovering())
		return
	ContextMenu.hide()

	Camera.clickStart.x = e.x
	Camera.clickStart.y = e.y
	Camera.movedForDrag = false

	// Grab object
	const worldPoint = mainViewport.screenToWorld(e.x, e.y)
	const hitResult = hitcheckSprites(worldPoint.x, worldPoint.y)
	/** @type {GameObject} */
	const hitResultObject = hitResult?.sprite?.meta?.gameobject
	if (e.button === 0 && hitResult && !hitResultObject.locked) {
		let sprite = hitResult.sprite
		bringToFront(sprite)

		const transform = hitResultObject.transform
		Camera.drag = {
			gameobject: hitResultObject,
			offsetX: transform.x - worldPoint.x,
			offsetY: transform.y - worldPoint.y,
			mode: e.button
		}

		if (hitResultObject.stack) {
			Camera.stack.isDrawing = true
			Camera.stack.timeout = setTimeout(() => {
				Camera.stack.isDrawing = false
				SpriteEffect.push(hitResult.sprite, SpriteEffect.DRAG)
			}, Stack.GRAB_TIMEOUT);
		} else {
			SpriteEffect.push(hitResult.sprite, SpriteEffect.DRAG)
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
export function onPointerMove(e) {
	Camera.screen.x = e.x
	Camera.screen.y = e.y
	Camera.world = mainViewport.screenToWorld(e.x, e.y)

	if (Camera.wheelTarget.target && Math.abs(Camera.wheelTarget.x - e.x) + Math.abs(Camera.wheelTarget.y - e.y) > 10)
		Camera.wheelTarget.target = null

	if (!Camera.drag)
		return

	Camera.movedForDrag = Camera.movedForDrag || 
		Math.abs(Camera.clickStart.x - e.x) + Math.abs(Camera.clickStart.y - e.y) > 5;

	if (!Camera.movedForDrag)
		return

	// Drag object
	if (Camera.drag.gameobject) {

		if (Camera.stack.isDrawing) {
			Camera.drag.gameobject = Stack.pop(Camera.drag.gameobject)
			Camera.stack.isDrawing = false
			SpriteEffect.push(Camera.drag.gameobject.sprite, SpriteEffect.DRAG)
			clearTimeout(Camera.stack.timeout)
		}


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

function onDropObject(gameobject) {
	const hits = hitcheckSpritesAll(Camera.world.x, Camera.world.y)
	for (let i = 1; i < hits.length; i++) {
		const hoverObject = hits[i].sprite.meta.gameobject
		if (!hoverObject)
			continue

		if (hoverObject.stack) {
			Stack.push(hoverObject, gameobject)
			bringToFront(hoverObject.sprite)
			return
		}

		if (hoverObject.stackable && hoverObject.stackable === gameobject.stackable) {
			Stack.fromGameObjects(hoverObject, gameobject)
			bringToFront(hoverObject.sprite)
			return
		}
	}
}

/** @param {PointerEvent} e  */
export function onPointerUp(e) {
	if (Camera.drag?.gameobject) {
		SpriteEffect.pop(Camera.drag.gameobject.sprite, SpriteEffect.DRAG)
		onDropObject(Camera.drag.gameobject)
	}
	//console.log(Camera.drag?.gameobject?.transform);
	Camera.drag = null
	if (e.button === 2)
		onContextMenu(e)
	Camera.movedForDrag = false
}

/**@param {MouseEvent} e  */
export function onClick(e) {
	if (ContextMenu.hovering) {
		ContextMenu.hovering.onClick?.(e)
		if (!ContextMenu.hovering.keepOpen)
			ContextMenu.hide()
	}
}

function onContextMenu(e) {
	if (Camera.movedForDrag)
		return
	const hitResult = hitcheckSprites(Camera.world.x, Camera.world.y)
	const gameobject = hitResult?.sprite?.meta?.gameobject
	if (gameobject) {
		showGameObjectContextMenu(gameobject)
	} else {
		showBaseContextMenu()
	}
}

function showBaseContextMenu() {
	// TODO(Lumi): Open a context menu based on the object/context
	ContextMenu
		.new()
		.label("Context Menu!")
		.button("Flip", () => console.log("Flop")).hotkey("F")
		.button("Shuffle", () => console.log("SHUFFLE")).hotkey("S")
		.idLabel(3310)
		.show(Camera.screen.x, Camera.screen.y)
}

/** @param {import("./components/typedefs").GameObject} gameobject  */
function showGameObjectContextMenu(gameobject) {
	ContextMenu
		.new()
		.button(gameobject.locked ? "Unlock" : "Lock", () => gameobject.locked = !gameobject.locked)
		.button("To hand", () => addToHand(gameobject))
	
	if (gameobject.flip)
		ContextMenu
			.button("Flip", () => Flippable.flip(gameobject)).hotkey("F")
	
	if (gameobject.stack)
		ContextMenu
			.button("Draw", () => Stack.pop(gameobject))
			.button("Flip", () => Stack.flip(gameobject)).hotkey("F")
			.button("Shuffle", () => Stack.shuffle(gameobject)).hotkey("S")

	if (gameobject.roll)
		ContextMenu
			.button("Roll", () => Roll.roll(gameobject)).hotkey("R")

	ContextMenu.idLabel(gameobject.id)
		.show(Camera.screen.x, Camera.screen.y)
}

/** @param {KeyboardEvent} e  */
export function onKeyPress(e) {
	const hit = hitcheckSprites(Camera.world.x, Camera.world.y)
	if (!hit?.sprite?.meta?.gameobject)
		return
	const gameobject = hit.sprite.meta.gameobject
	console.log(e.key);
	

	if (gameobject.flip)
		({ "f": () => Flippable.flip(gameobject) })[e.key]?.()

	if (gameobject.stack)
		({ 
			"f": () => Stack.flip(gameobject),
			"s": () => Stack.shuffle(gameobject),
		})[e.key]?.()

	if (gameobject.roll) {
		({ "r": () => Roll.roll(gameobject) })[e.key]?.()
		const num = parseInt(e.key)
		if (!isNaN(num) && num < gameobject.roll.textures.length)
			Roll.setValue(gameobject, num)
	}
	
}

export function setupCamera() {
	window.addEventListener("wheel", onWheel)
	window.addEventListener("pointerdown", onPointerDown)
	window.addEventListener("contextmenu", (e) => e.preventDefault())
	window.addEventListener("pointermove", onPointerMove)
	window.addEventListener("pointerup", onPointerUp)
	window.addEventListener("keypress", onKeyPress)
	window.addEventListener("click", onClick)
}
