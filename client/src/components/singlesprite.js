import { createSprite } from "../render/sprite"

/**
 * @typedef {import("../render/sprite").Sprite} SingleSprite
 */

/**
 * @param {src} texture 
 * @param {import("./typedefs").GameObject} object
 * @param {Partial<import("../render/sprite").Sprite>} options 
 * @returns 
 */
export function create(object, texture, options = {}) {
	const sprite = createSprite(texture, options)
	sprite.meta.gameobject = object
	sprite.transform.parent = object.transform
	object.sprite = sprite
}

export const SingleSprite = {
	create
}
