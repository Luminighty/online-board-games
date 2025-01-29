import { Transform } from "../utils/transform"

function push(sprite, effect) {
	if (sprite.effects[effect.key])
		return
	sprite.effects[effect.key] = true
	effect.push(sprite)
}

function pop(sprite, effect) {
	if (!sprite.effects[effect.key])
		return
	delete sprite.effects[effect.key]
	effect.pop(sprite)
}

export const SpriteEffect = {
	push, pop,
	DRAG: {
		key: "drag",
		push(sprite) {
			sprite.transform.scaleX += 0.05
			sprite.transform.scaleY += 0.05
			Transform.updateTransform(sprite.transform)
		},
		pop(sprite) {
			sprite.transform.scaleX -= 0.05
			sprite.transform.scaleY -= 0.05
			Transform.updateTransform(sprite.transform)
		}
	},
	

}
