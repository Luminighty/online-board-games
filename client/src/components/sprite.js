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
 * @param {import("../render/sprite").TextureData[]} textures 
 * @param {Partial<import("../render/sprite").Sprite>} options 
 * @returns 
 */
export function createMulti(object, options, ...textures) {
	// NOTE(Lumi): We need to clone the TextureData when creating a multisprite
	const cloned = textures.map((textData) => ({...textData}))
	options.transform = Transform.new({
		angle: options.angle,
		pivot: {x: cloned[0].width / 2, y: cloned[0].height / 2},
	})
	const sprite = createSprite(options, ...cloned)
	sprite.meta.gameobject = object
	sprite.transform.parent = object.transform
	object.sprite = sprite
}

export const GameSprite = {
	create, createMulti
}
