import { createSprite } from "../render/sprite"
import { Transform } from "../utils/transform"

/**
 * @param {import("../render/texture").Texture} texture 
 * @param {import("./typedefs").GameObject} object
 * @param {Partial<import("../render/sprite").Sprite>} options 
 * @returns 
 */
export function create(object, texture, options = {}) {
	const sprite = createSprite(options, {
		texture, width: options.width, height: options.height
	})
	sprite.meta.gameobject = object
	sprite.transform.parent = object.transform
	object.sprite = sprite
}

/**
 * @param {import("./typedefs").GameObject} object
 * @param {src} texture 
 * @param {Partial<import("../render/sprite").Sprite>} options 
 * @returns 
 */
export function createMulti(object, options, ...textures) {
	options.transform = Transform.new({
		angle: options.angle,
		pivot: {x: textures[0].width / 2, y: textures[0].height / 2},
	})
	const sprite = createSprite(options, ...textures)
	sprite.meta.gameobject = object
	sprite.transform.parent = object.transform
	object.sprite = sprite
}

export const GameSprite = {
	create, createMulti
}
