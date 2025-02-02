import { Animation } from "../render/animator"
import { assertComponent } from "./utils"


/**
 * @typedef {Object} Flippable
 * @property {boolean} flipped
 * @property {import("../render/texture").Texture} back
 * @property {import("../render/texture").Texture} front
 */


/**
 * @param {Partial<Flippable>} options 
 * @returns {{ flip: Flippable }}
 */
function create(gameobject, options = {}) {
	gameobject.flip = {
		flipped: options.flipped ?? false,
		back: options.back,
		front: options.front,
	}
	if (gameobject.sprite)
		gameobject.sprite.meta.handTextures = gameobject.flip.flipped ? [gameobject.flip.front] : [gameobject.flip.back]
	return gameobject
}

/** @param {import("./typedefs").GameObject} object */
function flip(object, playAnimation=true) {
	assertComponent(object, "flip", "flip")

	function doAFlip() {
		object.flip.flipped = !object.flip.flipped
		if (object.sprite) {
			object.sprite.textures[0].texture = object.flip.flipped ? object.flip.back : object.flip.front
			object.sprite.meta.handTextures[0] = object.flip.flipped ? object.flip.front : object.flip.back
		}
	}

	if (playAnimation) {
		Animation.create()
			.transform(object.sprite.transform, "scaleX", [0, 1], [60, 0], [120, 1])
			.callback(doAFlip, [60])
			.play()
	} else {
		doAFlip()
	}
}

export const Flippable = {
	create, flip
}