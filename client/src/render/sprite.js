import { getContext } from "./canvas"
import { idGen } from "../utils/id"
import { Matrix } from "../utils/matrix"
import { mainViewport } from "./viewport"
import { textureHitCheck } from "./texture"
import { Transform } from "../utils/transform"

/**
 * @typedef {Object} Sprite
 * @property {number} id
 * @property {import("./texture").Texture} texture
 * @property {import("../utils/transform").TransformT} transform
 * @property {boolean} hittable
 * @property {boolean} locked
 * @property {number} zIndex
 * @property {Object} meta
 * @property {import("../components/typedefs").GameObject?} meta.gameobject
 * @property {Function} updateTransform
 */

const spriteId = idGen()
/** @type {Sprite[]} */
const sprites = []
let zIndexDirty = false
/**
 * @param {import("./texture").Texture} texture 
 * @property {{transform: import("../utils/matrix").CanvasMatrix}} transform
 * @param {Partial<Sprite>} options
 */
export function createSprite(texture, options = {}) {
	const sprite = {
		id: spriteId(),
		texture,
		width: options.width,
		height: options.height,
		transform: options.transform ?? Transform.new({
			pivot: {x: options.width / 2, y: options.height / 2},
			angle: options.angle ?? 0,
		}),
		zIndex: options.zIndex ?? 0,
		hittable: options.hittable ?? true,
		meta: {},
	}
	sprites.push(sprite)
	zIndexDirty = true
	return sprite
}

export function setZIndexDirty() {
	zIndexDirty = true
}

export function destroySprite(sprite) {
	const index = sprites.findIndex((s) => s.id === sprite.id)
	if (index === -1)
		return
	sprites.splice(index, 1)
}

export function renderSprites() {
	if (zIndexDirty) {
		sprites.sort((l, r) => l.zIndex - r.zIndex)
		zIndexDirty = false
	}
	const context = getContext()
	for (const sprite of sprites) {
		context.save()
		applySpriteTransform(context, sprite.transform)
		if (sprite.texture.loaded)
			context.drawImage(sprite.texture.image, 0, 0, sprite.width, sprite.height)
		context.restore()
	}
}

/**
 * @param {CanvasRenderingContext2D} context 
 * @param {import("../utils/transform").TransformT} transform
 */
function applySpriteTransform(context, transform) {
	if (transform.parent)
		applySpriteTransform(context, transform.parent)
	context.transform(
		transform.transform.a,
		transform.transform.b,
		transform.transform.c,
		transform.transform.d,
		transform.transform.e,
		transform.transform.f,
	)
}

export function hitcheckSprites(worldX, worldY) {
	for (let i = sprites.length - 1; i >= 0; i--) {
		let s = sprites[i]
		
		const local = Matrix.applyVec(Transform.globalInverse(s.transform), worldX, worldY)
		const offsetX = local.x
		const offsetY = local.y
		
		if (textureHitCheck(s.texture, offsetX / s.width, offsetY / s.height))
			return s.hittable ? {sprite: s, offsetX, offsetY} : null
	}
	return null
}
