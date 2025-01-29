import { Flippable } from "./flip"
import { Roll } from "./roll"
import { Stack } from "./stack"


/**
 * @typedef {Object} GameObject
 * @property {number} id
 * @property {boolean} locked
 * @property {Flippable?} flip
 * @property {Stack?} stack
 * @property {string} stackable
 * @property {Roll} roll
 * @property {import("../render/sprite").Sprite?} sprite
 * @property {import("../utils/transform").TransformT} transform
 */
