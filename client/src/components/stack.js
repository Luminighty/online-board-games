/**
 * @typedef {Object} Stack
 * @property {import("./typedefs").GameObject[]} objects
 */

import { bringToFront, setZIndexDirty } from "../render/sprite"
import { Matrix } from "../utils/matrix"
import { createShuffleSeed, shuffleApply } from "../utils/random"
import { Transform } from "../utils/transform"
import { Flippable } from "./flip"
import { GameObject } from "./gameobject"
import { GameSprite } from "./sprite"
import { assertComponent } from "./utils"

const STACK_OFFSET = 10
const VISIBLE_ELEMENTS = 3
let GRAB_TIMEOUT = 300

/**
 * @param {import("./typedefs").GameObject} gameobject 
 * @param {Partial<Stack>} options 
 * @returns {import("./typedefs").GameObject}
 */
function create(gameobject, options = {}) {
	gameobject.stack = {
		objects: options.objects ?? [],
	}
	const objects = gameobject.stack.objects
	for (const object of objects)
		object.sprite.visible = false
	
	GameSprite.createMulti(gameobject, {}, objects[0].sprite.textures[0])
	updateStackTexture(gameobject)
	return gameobject
}

/** @param {import("../components/typedefs").GameObject} target  */
function fromGameObjects(target, ...rest) {
	const stack = GameObject.create()
	stack.transform = Transform.clone(target.transform)
	stackable(stack, target.stackable)
	const objects = [target]
	for (const r of rest) {
		if (r.stack) {
			objects.push(...r.stack.objects)
			GameObject.destroy(r)
		} else {
			objects.push(r)
		}
	}

	Stack.create(stack, { objects })
}

/** @param {import("./typedefs").GameObject} gameobject */
function updateStackTexture(gameobject) {
	assertComponent(gameobject, "stack", "updateStackTexture")
	assertComponent(gameobject, "sprite", "updateStackTexture")
	const objects = gameobject.stack.objects

	const length = Math.min(objects.length, VISIBLE_ELEMENTS)
	gameobject.sprite.textures.length = length
	for (let i = 0; i < length; i++) {
		gameobject.sprite.textures[length - i] = {
			texture: objects[objects.length - i - 1].sprite.textures[0].texture,
			height: objects[objects.length - i - 1].sprite.textures[0].height,
			width: objects[objects.length - i - 1].sprite.textures[0].width,
			y: i * STACK_OFFSET,
			x: 0
		}
	}
}

/** @param {import("./typedefs").GameObject} gameobject */
function pop(gameobject) {
	assertComponent(gameobject, "stack", "pop")

	const objects = gameobject.stack.objects
	const popped = objects.pop(objects)
	popped.transform.x = gameobject.transform.x
	popped.transform.y = gameobject.transform.y
	popped.transform.angle = gameobject.transform.angle
	if (popped.sprite) {
		popped.sprite.visible = true
		bringToFront(popped.sprite)
	}

	if (objects.length == 1) {
		const popped = objects.pop(objects)
		const newPosition = Matrix.applyVec(gameobject.transform.transform, 0, STACK_OFFSET)
		popped.transform.x = newPosition.x
		popped.transform.y = newPosition.y
		popped.transform.angle = gameobject.transform.angle
		if (popped.sprite)
			popped.sprite.visible = true

		Transform.updateTransform(popped.transform)

		GameObject.destroy(gameobject)
	} else {
		updateStackTexture(gameobject)
	}
	return popped
}

function mergeStacks(gameobject, other) {
	const objects = gameobject.stack.objects
	objects.push(...other.stack.objects)
	GameObject.destroy(other)
	updateStackTexture(gameobject)
}

/** 
 * @param {import("./typedefs").GameObject} gameobject 
 * @param {import("./typedefs").GameObject} other
 */
function push(gameobject, other) {
	assertComponent(gameobject, "stack", "push")

	if (other.stack) {
		mergeStacks(gameobject, other)
		return
	}
	
	if (other.sprite)
		other.sprite.visible = false

	const objects = gameobject.stack.objects
	objects.push(other)

	updateStackTexture(gameobject)
}

/** @param {import("./typedefs").GameObject} gameobject */
function shuffle(gameobject) {
	assertComponent(gameobject, "stack", "shuffle")
	const seed = createShuffleSeed(gameobject.stack.objects.length)
	shuffleApply(gameobject.stack.objects, seed)
	updateStackTexture(gameobject)
}

/** @param {import("./typedefs").GameObject} gameobject */
function flip(gameobject) {
	assertComponent(gameobject, "stack", "flip")

	for (const object of gameobject.stack.objects)
		if (object.flip)
			Flippable.flip(object)
	gameobject.stack.objects = gameobject.stack.objects.reverse()
	updateStackTexture(gameobject)
}

function stackable(gameobject, kind) {
	gameobject.stackable = kind
}


export const Stack = {
	create, pop, push, shuffle, 
	GRAB_TIMEOUT, flip, stackable, fromGameObjects
}