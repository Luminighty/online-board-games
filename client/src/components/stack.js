/**
 * @typedef {Object} Stack
 * @property {import("./typedefs").GameObject[]} objects
 */

import { Animation } from "../render/animator"
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
		const obj = objects[objects.length - i - 1]
		const textureData = obj.sprite.textures[0]
		if (!gameobject.sprite.textures[length - i - 1])
			gameobject.sprite.textures[length - i - 1] = { transform: Transform.new() }

		const stackTexture = gameobject.sprite.textures[length - i - 1]

		// We need to ensure that the texture transform stays the same for animations to work properly
		stackTexture.texture = textureData.texture
		stackTexture.height = textureData.height
		stackTexture.width = textureData.width
		stackTexture.transform.y = obj.sprite.textures[0].height / 2 + i * STACK_OFFSET
		stackTexture.transform.x = obj.sprite.textures[0].width / 2
		stackTexture.transform.pivot.x = obj.sprite.textures[0].width / 2
		stackTexture.transform.pivot.y = obj.sprite.textures[0].height / 2
		Transform.updateTransform(stackTexture.transform)
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
function shuffle(gameobject, playAnimation=true) {
	assertComponent(gameobject, "stack", "shuffle")
	const seed = createShuffleSeed(gameobject.stack.objects.length)

	function doShuffle() {
		shuffleApply(gameobject.stack.objects, seed)
		updateStackTexture(gameobject)
	}

	if (playAnimation) {
		const animation = Animation.create()
		let sign = 1
		for (const textureData of gameobject.sprite.textures) {
			animation.transform(textureData.transform, "angle", [0, 0], [300, Math.PI * sign], [350, Math.PI * sign], [650, 0])
			sign *= -1
		}
		animation
			.callback(doShuffle, [325])
			.play()
	} else {
		doShuffle()
	}

}

/** @param {import("./typedefs").GameObject} gameobject */
function flip(gameobject, playAnimation=true) {
	assertComponent(gameobject, "stack", "flip")

	function doAFlip() {
		for (const object of gameobject.stack.objects)
			if (object.flip)
				Flippable.flip(object, false)
		gameobject.stack.objects = gameobject.stack.objects.reverse()
		updateStackTexture(gameobject)
	}

	if (playAnimation) {
		Animation.create()
			.transform(gameobject.sprite.transform, "scaleX", [0, 1], [60, 0], [120, 1])
			.callback(doAFlip, [60])
			.play()
	} else {
		doAFlip()
	}
}

function stackable(gameobject, kind) {
	gameobject.stackable = kind
}


export const Stack = {
	create, pop, push, shuffle, 
	GRAB_TIMEOUT, flip, stackable, fromGameObjects
}