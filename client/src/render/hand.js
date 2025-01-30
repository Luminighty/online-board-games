import { Camera } from "../camera"
import { Matrix } from "../utils/matrix"
import { Transform } from "../utils/transform"
import { Animation } from "./animator"
import { getContext } from "./canvas"
import { sprites, applySpriteTransform, applySpriteInverseTransform } from "./sprite"

const Hand = {
	worldTransform: Transform.new({ x: -200, y: 300, angle: Math.PI / 3 }),
	screenTransform: Transform.new({ scaleX: 0.5, scaleY: 0.5 }),
	width: 500,
	height: 200,
	/** @type {import("./sprite").Sprite[]} */
	sprites: [],
}

window.addEventListener("keypress", (e) => {
	if (e.key == "r")
		Animation.create()
			.transform(Hand.worldTransform, "angle", [0, 0], [1000, Math.PI * 2])
			.play()
})

export function isInHand() {
	const worldhand = Matrix.applyVec(Hand.worldTransform.inverse, Camera.world.x, Camera.world.y)
	return worldhand.x >= 0 && worldhand.x <= Hand.width && 
		worldhand.y >= 0 && worldhand.y <= Hand.height
}

export function addToHand(gameobject) {
	gameobject.meta.isInHand = true
	Hand.sprites.push(gameobject.sprite)
}

export function removeFromHand(gameobject) {
	gameobject.meta.isInHand = false
	const id = Hand.sprites.findIndex((sprite) => sprite.id === gameobject.sprite.id)
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
		// NOTE(Lumi): When we have a specific texture to render in hand,
		//             we choose that over the default
		if (sprite.meta.handTexture && sprite.meta.handTexture.loaded) {
			context.drawImage(
				sprite.meta.handTexture.image, 
				0, 0,
				sprite.textures[0].width, sprite.textures[0].height
			)
		} else {
			for (let i = 0; i < sprite.textures.length; i++) {
				const textureData = sprite.textures[i]
				if (textureData.texture.loaded)
					context.drawImage(
						textureData.texture.image, 
						textureData.x, textureData.y, 
						textureData.width, textureData.height
					)
			}
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
}

export function setupHand() {
	window.addEventListener("resize", onResize)

	onResize()
}
