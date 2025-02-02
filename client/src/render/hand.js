import { Camera } from "../camera"
import { Matrix } from "../utils/matrix"
import { Transform } from "../utils/transform"
import { Animation } from "./animator"
import { getContext } from "./canvas"
import { sprites, applySpriteTransform, applySpriteInverseTransform, applyMatrixToContext, hitcheckSprites } from "./sprite"
import { mainViewport } from "./viewport"

export const Hand = {
	worldTransform: Transform.new({ x: -900, y: 0, angle: Math.PI / 2 }),
	screenTransform: Transform.new({ scaleX: 0.75, scaleY: 0.75 }),
	handToWorld: Transform.new(),
	width: 500,
	height: 200,
	/** @type {import("./sprite").Sprite[]} */
	sprites: [],
}

export function isInHand() {
	const worldhand = Matrix.applyVec(Hand.worldTransform.inverse, Camera.world.x, Camera.world.y)
	return worldhand.x >= 0 && worldhand.x <= Hand.width && 
		worldhand.y >= 0 && worldhand.y <= Hand.height
}

export function isInScreenHand() {
	const screenHand = Matrix.applyVec(Hand.screenTransform.inverse, Camera.screen.x, Camera.screen.y)
	return screenHand.x >= 0 && screenHand.x <= Hand.width && 
		screenHand.y >= 0 && screenHand.y <= Hand.height
}

/** @param {import("../components/typedefs").GameObject} gameobject  */
export function addToHand(gameobject) {
	gameobject.meta.isInHand = true
	Hand.sprites.push(gameobject.sprite)
}

/** @param {import("../components/typedefs").GameObject} gameobject  */
export function removeFromHand(gameobject) {
	gameobject.meta.isInHand = false
	const id = Hand.sprites.findIndex((sprite) => sprite.id === gameobject.sprite.id)
	if (id == -1)
		return
	Hand.sprites.splice(id, 1)
}

export function renderHandArea() {
	const context = getContext()
	context.save()
	applySpriteTransform(context, Hand.worldTransform)
	context.fillStyle = "#00aaaaaa"
	context.fillRect(0, 0, Hand.width, Hand.height)
	context.restore()
}

export function renderHandContents() {
	const context = getContext()

	context.save()
	applySpriteTransform(context, Hand.screenTransform)

	context.fillStyle = "#00000055"
	context.fillRect(0, 0, Hand.width, Hand.height)

	applySpriteInverseTransform(context, Hand.worldTransform)
	for (const sprite of Hand.sprites) {
		if (!sprite.visible)
			continue
		context.save()
		applySpriteTransform(context, sprite.transform)
		for (let i = 0; i < sprite.textures.length; i++) {
			const textureData = sprite.textures[i]
			// NOTE(Lumi): When we have a specific texture to render in hand,
			//             we choose that over the default
			const texture = sprite.meta.handTextures?.[i] ?? textureData.texture
			if (!texture.loaded)
				continue
			context.save()
			applyMatrixToContext(context, textureData.transform.transform)
			context.drawImage(
				texture.image, 
				0, 0, 
				textureData.width, textureData.height
			)
			context.restore()
		}
		context.restore()
	}
	context.restore()
}

function onResize(e) {
	Hand.width = Math.min(window.innerWidth, 800)
	Hand.worldTransform.pivot.x = Hand.width / 2
	Hand.worldTransform.pivot.y = Hand.height / 2

	Hand.screenTransform.pivot.x = Hand.width / 2
	Hand.screenTransform.pivot.y = Hand.height
	Hand.screenTransform.x = window.innerWidth / 2
	Hand.screenTransform.y = window.innerHeight

	Transform.updateTransform(Hand.screenTransform)
	Transform.updateTransform(Hand.worldTransform)
	Hand.handToWorld = Matrix.apply(Hand.worldTransform.transform, Hand.screenTransform.inverse)
}

window.addEventListener("keypress", (e) => {
	let res = Matrix.applyVec(Hand.screenTransform.inverse, Camera.screen.x, Camera.screen.y)
	res = Matrix.applyVec(Hand.worldTransform.transform, res.x, res.y)
	//const hitResult = hitcheckSprites(res.x, res.y)
	console.log(res);
})

export function handHitCheck() {
	if (!isInScreenHand())
		return null
	const worldPos = Matrix.applyVec(Hand.handToWorld, Camera.screen.x, Camera.screen.y)
	
	const result = hitcheckSprites(worldPos.x, worldPos.y)
	if (!result)
		return null
	return result
}


export function setupHand() {
	window.addEventListener("resize", onResize)

	onResize()
}
