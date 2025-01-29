import { Flippable } from "../components/flip"
import { GameObject } from "../components/gameobject"
import { GameSprite } from "../components/sprite"
import { Stack } from "../components/stack"
import { loadTexture } from "../render/texture"

/**
 * @typedef {Object} BaseOptions
 * @property {number} x
 * @property {number} y
 * @property {number} angle
 * @property {string} src
 * @property {number} width
 * @property {number} height
 */

/**
 * @param {BaseOptions} options
 * @returns {import("../components/typedefs").GameObject}
 */
export function StaticPiece(options = {}) {
	const object = BasePiece(options)
	object.locked = true
	return object
}


/**
 * @param {number} options
 * @returns {import("../components/typedefs").GameObject}
 */
export function BasePiece({x, y, angle, src, width, height} = {}) {
	const texture = loadTexture(src)
	const object = GameObject.create({x, y, angle})
	GameSprite.create(object, texture, {width, height})
	return object
}



/** 
 * @typedef CardOptions
 * @property {string} front
 * @property {string} back
 * @property {boolean} flipped
 */

/**
 * @param {CardOptions & BaseOptions} options 
 */
export function Card(options = {}) {
	console.assert(options.back, "Card BACK not defined!", options)
	console.assert(options.front, "Card FRONT not defined!", options)
	options.src = options.src ?? (options.flipped ? options.back : options.front)
	const object = BasePiece(options)
	Flippable.create(object, {
		flipped: options.flipped ?? false,
		front: loadTexture(options.front),
		back: loadTexture(options.back),
	})
	Stack.stackable(object, options.stackType ?? "card")
	return object
}