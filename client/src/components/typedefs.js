import { Flippable } from "./flip"


/**
 * @typedef {Object} GameObject
 * @property {number} id
 * @property {boolean} locked
 * @property {Flippable?} flip
 * @property {Object} transform
 * @property {number} transform.x
 * @property {number} transform.y
 * @property {number} transform.scaleX
 * @property {number} transform.scaleY
 * @property {number} transform.angle
 * @property {import("../utils/matrix").CanvasMatrix} transform.transform
 * @property {import("../utils/matrix").CanvasMatrix} transform.inverse
 */
