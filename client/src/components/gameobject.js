import { destroySprite } from "../render/sprite"
import { Matrix } from "../utils/matrix"
import { Transform } from "../utils/transform"

let lastId = 0;

/** @type {import("./typedefs").GameObject[]} */
const gameObjects = []

/** @returns {import("./typedefs").GameObject} */
function create(options = {}) {
	if (options.id > lastId)
		lastId = options.id
	const object = {
		id: options.id ?? lastId++,
		locked: options.locked ?? false,
		transform: Transform.new(options)
	}
	gameObjects.push(object)
	return object
}

function destroy(gameobject) {
	const index = gameObjects.findIndex((o) => o.id === gameobject.id)
	if (index >= 0)
		gameObjects.splice(index, 1)
	if (gameobject.sprite)
		destroySprite(gameobject.sprite)
}

export const GameObject = {
	create, destroy
}