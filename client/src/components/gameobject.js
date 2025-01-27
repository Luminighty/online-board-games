import { Matrix } from "../utils/matrix"
import { Transform } from "../utils/transform"

let lastId = 0;

/** @returns {import("./typedefs").GameObject} */
export function create(options = {}) {
	return {
		id: options.id ?? lastId++,
		locked: options.locked ?? false,
		transform: Transform.new(options)
	}
}

export const GameObject = {
	create
}