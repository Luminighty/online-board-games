/** 
 * @typedef {Object} Texture 
 * @property {HTMLImageElement} image
 * @property {string} src
 * @property {number} width
 * @property {number} height
 * @property {Uint8Array?} hitmap
 * @property {number?} hitmapWidth
 * @property {number?} hitmapHeight
 * @property {boolean} loaded
 */

import { packBooleans, packedBooleanGet } from "../utils/packedBool"

/** @type {Texture[]} */
const textures = []
/** @type {{count: number, hitmap: Uint8Array}[]} */
let hitmaps = []

const HITCHECK_DOWNSCALE = 20

// TODO(Lumi): We might have to move this node creation into image.onload
const transparencyCanvas = document.createElement("canvas")
transparencyCanvas.id = "transparency"
transparencyCanvas.width = 200
transparencyCanvas.height = 200
transparencyCanvas.style.scale = 10
transparencyCanvas.style.imageRendering = "pixelated"
//document.body.appendChild(transparencyCanvas)
/** @type {CanvasRenderingContext2D} */
const transparencyContext = transparencyCanvas.getContext("2d", {willReadFrequently: true})

function findTexture(src) {
	return textures.find((texture) => texture.src === src)
}

/** @param {Uint8Array} hitmap  */
export function findHitmap(hitmap) {
	return hitmaps.find((h) => {
		if (hitmap.length !== h.hitmap.length)
			return false
		return hitmap.every((v, i) => h.hitmap[i] === v)
	})
}

/** @param {Texture} texture  */
export function textureHitCheck(texture, x, y) {
	if (x < 0 || y < 0 || x >= 1 || y >= 1)
		return false
	if (!texture.hitmap)
		return true
	let hitX = Math.round(x * texture.hitmapWidth)
	let hitY = Math.round(y * texture.hitmapHeight)
	return packedBooleanGet(texture.hitmap, hitX + hitY * texture.hitmapWidth)
}

export function loadTexture(src) {
	const cached = findTexture(src)
	if (cached)
		return cached
	const image = new Image()
	const texture = { src, image, width: 0, height: 0, loaded: false }

	image.src = src
	image.onload = (e) => {
		texture.width = image.width
		texture.height = image.height
		texture.loaded = true

		const hitWidth = Math.floor(image.width / HITCHECK_DOWNSCALE)
		const hitHeight = Math.floor(image.height / HITCHECK_DOWNSCALE)
		transparencyCanvas.width = hitWidth
		transparencyCanvas.height = hitHeight
		transparencyContext.clearRect(0, 0, hitWidth, hitHeight)
		transparencyContext.drawImage(image, 0, 0, hitWidth, hitHeight)
		const imageData = transparencyContext.getImageData(0, 0, hitWidth, hitHeight)
		const transparency = []
		let foundTransparent = false
		for (let y = 0; y < hitHeight; y++) {
			for (let x = 0; x < hitWidth; x++) {
				let index = x + y * hitWidth
				const isOpaque = imageData.data[index * 4 + 3] > 40
				foundTransparent = foundTransparent || !isOpaque
				transparency[index] = isOpaque
				imageData.data[index * 4 + 0] = isOpaque ? 255 : 0
				imageData.data[index * 4 + 1] = isOpaque ? 255 : 0
				imageData.data[index * 4 + 2] = isOpaque ? 255 : 0
				imageData.data[index * 4 + 3] = isOpaque ? 255 : 0
			}
		}
		if (foundTransparent) {
			let hitmap = packBooleans(transparency)
			const existingHitmap = findHitmap(hitmap)
			if (existingHitmap) {
				hitmap = existingHitmap.hitmap
				existingHitmap.count++
			} else {
				hitmaps.push({count: 1, hitmap})
			}
			texture.hitmap = hitmap
			texture.hitmapWidth = hitWidth
			texture.hitmapHeight = hitHeight
		}
		transparencyContext.putImageData(imageData, 0, 0)
	}

	textures.push(texture)

	return texture
}

export function unloadTexture(src) {
	const index = textures.findIndex((texture) => texture.src === src)
	if (index === -1)
		return
	textures[index].width = 0
	textures[index].height = 0
	textures[index].loaded = false
	textures[index].image = null
	textures.splice(index, 1)

	if (textures[index].hitmap) {
		const entry = findHitmap(textures[index].hitmap)
		entry.count--
		if (entry.count === 0)
			hitmaps = hitmaps.filter((e) => e.count > 0)
	}
}