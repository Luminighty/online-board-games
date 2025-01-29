import { Transform } from "../utils/transform"
import { getContext } from "./canvas"
import { sprites, applySpriteTransform, applySpriteInverseTransform } from "./sprite"

const Hand = {
	worldTransform: Transform.new({
		x: -200, y: 800
	}),
	screenTransform: Transform.new({
		x: 0, y: window.innerHeight - 200
	}),
	width: 500,
	height: 200,
	/** @type {import("./sprite").Sprite[]} */
	sprites: [],
}

export function addToHand(gameobject) {
	Hand.sprites.push(gameobject.sprite)
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
	applySpriteInverseTransform(context, Hand.worldTransform)
	applySpriteTransform(context, Hand.screenTransform)
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
	Hand.width = window.innerWidth
	Hand.screenTransform.y = window.innerHeight - 200
	Transform.updateTransform(Hand.screenTransform)
}

export function setupHand() {
	window.addEventListener("resize", onResize)

	onResize()
}
