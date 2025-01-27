/**
 * @typedef {Object} Flippable
 * @property {boolean} flipped
 * @property {string} back
 * @property {string} front
 */

/**
 * @param {Partial<Flippable>} options 
 * @returns {{ flip: Flippable }}
 */
function create(options = {}) {
	return {
		flip: {
			flipped: options.flipped ?? false,
			back: options.back ?? "backside",
			front: options.front ?? "frontside",
		}
	}
}

/** @param {import("./typedefs").GameObject} object */
function flip(object) {
	console.assert(object.flip, `Attempted to flip a gameobject, but it is not flippable (ID=${object.id})`, {object})
	object.flip.flipped = !object.flip.flipped
	console.log(`Flipping`, object);
}

export const Flippable = {
	create, flip
}