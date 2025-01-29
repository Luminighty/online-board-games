import { generateSequence } from "../utils/random"
import { assertComponent } from "./utils"

/**
 * @typedef {Object} Roll
 * @prop {import("../render/texture").Texture[]} textures
 * @prop {number} value
 */

/**
 * @param {import("./typedefs").GameObject} gameobject 
 * @param {Partial<Roll>} options 
 */
function create(gameobject, options = {}) {
	console.assert(options.textures.length > 0, "Roll textures missing!", gameobject, options);
	gameobject.roll = { 
		textures: options.textures,
		value: options.value ?? 0,
	}
}


/**
 * 
 * @param {import("./typedefs").GameObject} gameobject 
 * @param {number} value 
 */
function setValue(gameobject, value) {
	assertComponent(gameobject, "roll", "setValue")
	console.assert(gameobject.roll.textures.length > value, "Setting value higher than max!", gameobject, value);
	gameobject.roll.value = value
	if (gameobject.sprite)
		gameobject.sprite.textures[0].texture = gameobject.roll.textures[value]
}

/**
 * @param {import("./typedefs").GameObject} gameobject 
 */
function roll(gameobject) {
	assertComponent(gameobject, "roll", "roll")
	const newValue = Math.floor(Math.random() * gameobject.roll.textures.length)
	// TODO(Lumi): Do some cool animation

	const nums = generateSequence(gameobject.roll.textures.length, 20)
	let timeDelay = 0
	for (let i = 0; i < nums.length; i++) {
		setTimeout(() => setValue(gameobject, nums[i]), timeDelay)
		timeDelay += Math.random() * i * 10
	}
}


export const Roll = {
	create, roll, setValue
}