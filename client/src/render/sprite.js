import { getContext } from "./canvas"
import { idGen } from "../utils/id"
import { Matrix } from "../utils/matrix"
import { mainViewport } from "./viewport"
import { textureHitCheck } from "./texture"
import { Transform } from "../utils/transform"

/**
 * @typedef {Object} Sprite
 * @property {number} id
 * @property {TextureData[]} textures
 * @property {import("../utils/transform").TransformT} transform
 * @property {boolean} hittable
 * @property {boolean} locked
 * @property {boolean} visible
 * @property {number} zIndex
 * @property {Object} meta
 * @property {import("../components/typedefs").GameObject?} meta.gameobject
 * @property {Function} updateTransform
 */

const spriteId = idGen()
/** @type {Sprite[]} */
export const sprites = []
let zIndexDirty = false

/**
 * @typedef {Object} TextureData
 * @prop {number} width
 * @prop {number} height
 * @prop {number} x
 * @prop {number} y
 * @prop {import("./texture").Texture} texture
 */

/**
 * @param {Partial<TextureData>[]} textures
 * @param {Partial<Sprite>} options
 */
export function createSprite(options = {}, ...textures) {
	const sprite = {
		id: spriteId(),
		textures: textures.map((texture) => {
			console.assert(texture.width != null, "Width was not defined for sprite texture!", texture)
			console.assert(texture.height != null, "Height was not defined for sprite texture!", texture)
			console.assert(texture.texture != null, "Texture was not defined for sprite texture!", texture)
			texture.x = texture.x ?? 0
			texture.y = texture.y ?? 0
			return texture
		}),
		transform: options.transform ?? Transform.new({
			pivot: {x: options.width / 2, y: options.height / 2},
			angle: options.angle ?? 0,
		}),
		effects: {},
		zIndex: options.zIndex ?? 0,
		hittable: options.hittable ?? true,
		visible: options.visible ?? true,
		meta: {},
	}
	sprites.push(sprite)
	zIndexDirty = true
	return sprite
}


/** @param {Sprite} sprite */
export function bringToFront(sprite) {
	for (let i = 0; i < sprites.length; i++)
		sprites[i].zIndex = i
	sprite.zIndex = sprites.length
	setZIndexDirty()
}

/** @param {Sprite} sprite */
export function bringToBack(sprite) {
	for (let i = 0; i < sprites.length; i++)
		sprites[i].zIndex = i + 1
	sprite.zIndex = 0
	setZIndexDirty()
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
		if (!sprite.visible)
			continue
		context.save()
		applySpriteTransform(context, sprite.transform)
		for (let i = 0; i < sprite.textures.length; i++) {
			const textureData = sprite.textures[i]
			if (textureData.texture.loaded)
				context.drawImage(
					textureData.texture.image, 
					textureData.x, textureData.y, 
					textureData.width, textureData.height
				)
		}
		context.restore()
	}
}

/**
 * @param {CanvasRenderingContext2D} context 
 * @param {import("../utils/transform").TransformT} transform
 */
export function applySpriteTransform(context, transform) {
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

/**
 * @param {CanvasRenderingContext2D} context 
 * @param {import("../utils/transform").TransformT} transform
 */
export function applySpriteInverseTransform(context, transform) {
	context.transform(
		transform.inverse.a,
		transform.inverse.b,
		transform.inverse.c,
		transform.inverse.d,
		transform.inverse.e,
		transform.inverse.f,
	)
	if (transform.parent)
		applySpriteTransform(context, transform.parent)
}

/**
 * @param {Sprite} sprite 
 */
function getSpriteHitData(worldX, worldY, sprite) {
	if (!sprite.hittable || !sprite.visible)
		return null
	
	const local = Matrix.applyVec(Transform.globalInverse(sprite.transform), worldX, worldY)
	for (let j = 0; j < sprite.textures.length; j++) {
		const offsetX = local.x + sprite.textures[j].x
		const offsetY = local.y + sprite.textures[j].y
		const width = sprite.textures[j].width
		const height = sprite.textures[j].height

		if (textureHitCheck(sprite.textures[j].texture, offsetX / width, offsetY / height))
			return {sprite, offsetX: local.x, offsetY: local.y}
	}
	return null
}

export function hitcheckSprites(worldX, worldY) {
	for (let i = sprites.length - 1; i >= 0; i--) {
		const result = getSpriteHitData(worldX, worldY, sprites[i])
		if (result)
			return result
	}
	return null
}


export function hitcheckSpritesAll(worldX, worldY) {
	const results = []
	for (let i = sprites.length - 1; i >= 0; i--) {
		const result = getSpriteHitData(worldX, worldY, sprites[i])
		if (result)
			results.push(result)
	}
	return results
}
