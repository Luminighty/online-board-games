import { GameObject } from "./components/gameobject"
import { GameSprite } from "./components/sprite"
import { loadTexture } from "./render/texture"
import { StaticPiece } from "./templates/common"

const WIDTH = 250
const HEIGHT = 289

function tile_pos(x, y) {
	let worldX = x * (WIDTH - 2) / 2
	let worldY = y * (HEIGHT - 2) * 1.5
	if (x % 2 != 0)
		worldY -= (HEIGHT - 1) * 0.75
	return { x: worldX, y: worldY }
}

function piece(kind, color, x, y) {
	const [width, height] = {
		"road": [21, 104],
		"settl": [48, 50],
		"costs": [320, 400],
	}[kind]
	const texture = loadTexture(`assets/settlers/pieces/${kind}_${color}.png`)
	
	const object = {
		...GameObject.create({x, y}),
	}
	GameSprite.create(object, texture, {
		width, height,
	})
}

function playerkit(color, x, y) {
	for (let offset = 0; offset < 15; offset++)
		piece("road", color, x + offset * 10, y)
	for (let offset = 0; offset < 5; offset++)
		piece("settl", color, x + offset * 10, y + 100)
	piece("costs", color, x, y + 300)
}

function num_tile(value, _x, _y) {
	const tile_size = 74
	const {x, y} = tile_pos(_x, _y);
	StaticPiece({
		src: `assets/settlers/num_tile/num_${value}.png`,
		width: tile_size, height: tile_size,
		x, y: y + tile_size / 2
	})
}

function sea(x, y, angle) {
	StaticPiece({
		src: `assets/settlers/tiles/tile_sea.png`,
		x, y, width: 1500 / 2, height: 423 / 2, 
		angle: angle * Math.PI / 3,
	})
}

function tile(type, x, y) {
	StaticPiece({
		src: `assets/settlers/tiles/tile_${type}.png`,
		width: WIDTH, height: HEIGHT,
		...tile_pos(x, y),
	})
}

/** @param {Array} tiles  */
function pick(tiles) {
	return tiles.splice(Math.floor(Math.random() * tiles.length), 1)[0]
}

function load() {
	tile("desert", 0, 0)

	const tiles = [
		...Array(3).fill("ore"),
		...Array(3).fill("brick"),
		...Array(4).fill("wool"),
		...Array(4).fill("lumber"),
		...Array(4).fill("grain"),
	]
	
	const num_tiles = [
		2, 3, 3, 4, 4, 5, 5, 6, 6,
		8, 8, 9, 9, 10, 10, 11, 11, 12
	]
	const positions = [
		      [-2, -1], [0, -1], [2, -1],
		   [-3, 0], [-1, 0], [1, 0], [3, 0],
		[-4, 0], [-2, 0],        [2, 0], [4, 0],
		   [-3, 1], [-1, 1], [1, 1], [3, 1],
		       [-2, 1], [0, 1], [2, 1],
	]
	for (const [x, y] of positions) {
		tile(pick(tiles), x, y)
		num_tile(pick(num_tiles), x, y)
	}
	sea(124, 606, 0)
	sea(-462, 409, 1)
	sea(-586, -196, 2)
	sea(-125, -606, 3)
	sea(462, -410, 4)
	sea(585, 197, 5)
	playerkit("red", 0, 700)
}

export const Catan = { load }