/*
	NOTE(Lumi): 
	  - +x: back
		- +y: Up (Towards camera)
		- +z = right
*/

import { Matrix3 } from "../utils/matrix3"
import { getContext } from "./canvas"
import { loadTexture } from "./texture"


const vertices = [
	[ 1, 1,  1, 1], // URB
	[ 1, 1, -1, 1],  // ULB
	[-1, 1, -1, 1], // ULF
	[-1, 1,  1, 1], // URF

	[ 1, -1,  1, 1], // URB
	[ 1, -1, -1, 1],  // ULB
	[-1, -1, -1, 1], // ULF
	[-1, -1,  1, 1], // URF
]

const faces = [
	[6, 5, 4, 7], // BOTTOM
	[5, 1, 0, 4], // BACK
	[2, 1, 5, 6], // LEFT
	[7, 4, 0, 3], // RIGHT
	[2, 6, 7, 3], // FRONT
	[1, 2, 3, 0], // TOP
]

/*
Cube indeces

    1_______ 0
   /|      / |
  / |     /  |
2/_______/3  |
 |  |    |   |
 | 5|___ | __|4
 |  /    |  /
 | /     | /
6|/______/7

*/

const sides = Array(6).fill(1)
	.map((_, idx) => `assets/default/white/side_${idx + 1}.png`)
	.map((src) => loadTexture(src))

console.log(sides);

const color = [
	"white",
	"yellow",
	"green",
	"blue",
	"red",
	"orange",
]

let angle = Math.PI / 4
let transform

const deg90 = Math.PI / 2
const deg270 = 3 * Math.PI / 2
const deg180 = Math.PI
const sideAngles = [
	[0, 0, 0],
	[0, 0, -deg90],
	[deg90, 0, 0],
	[-deg90, 0, 0],
	[0, 0, deg90],
	[0, 0, deg180],
]

let currentAngles = [0, 0, 0]
let currentSide = 0
window.addEventListener(("keypress"), (e) => {
	const n = parseInt(e.key)
	if (!isNaN(n) && n > 0 && n < 7) {
		currentSide = n - 1
		updateTransform()
	}
})

function updateZIndex() {
	const appliedVertices = applyTransformToVertices(transform, vertices)
	const centerYs = faces.map((face) => {
		const ySum = face.reduce((prev, curr) => prev + appliedVertices[curr][2], 0)
		return ySum / face.length
	})
	console.log(centerYs);
	const zipped = faces.map((_, idx) => [idx, centerYs[idx]])
	renderOrder = zipped.sort(([_lface, l], [_right, r]) => l - r).map(([faceIdx]) => faceIdx)
}

function step(from, target, maxDelta) {
	const delta = target - from
	const sign = Math.sign(target - from)
	if (Math.abs(delta) > maxDelta)
		return from + maxDelta * sign
	return from + delta
}

function updateTransform() {
	transform = Matrix3.applyAll(
		Matrix3.identity(),
		Matrix3.translate(100, 100, 100),
		Matrix3.rotateX(currentAngles[0]),
		Matrix3.rotateY(currentAngles[1]),
		Matrix3.rotateZ(currentAngles[2]),
		//Matrix3.rotateZ(angle),
		Matrix3.scale(50, 50, 50),
	)
	
	//updateZIndex()
}
console.log(transform);


function applyTransformToVertices(transform, vertices) {
	const applied = []
	for (let i = 0; i < vertices.length; i++) {
		applied[i] = Matrix3.applyVec(transform, vertices[i])
	}
	return applied
}

const Vec3UP = [0, 1, 0]

function vec3Cross(a, b) {
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0],
	]
}
function vec3Sub(a, b) {
	return [
		a[0] - b[0],
		a[1] - b[1],
		a[2] - b[2],
	]
}

export function renderCube(dt) {
	const context = getContext()
	
	currentAngles[0] = step(currentAngles[0], sideAngles[currentSide][0], dt * 0.01)
	currentAngles[1] = step(currentAngles[1], sideAngles[currentSide][1], dt * 0.01)
	currentAngles[2] = step(currentAngles[2], sideAngles[currentSide][2], dt * 0.01)
	updateTransform()

	context.fillStyle = "white"
	context.strokeStyle = "black"
	context.lineWidth = 1

	const appliedVertices = applyTransformToVertices(transform, vertices)
	const projectedVertices = appliedVertices.map(projectOrtho)
	for (let i = 0; i < faces.length; i++) {
		if (!sides[i].loaded)
			continue
		const face = faces[i]
		const vLeft = vec3Sub(appliedVertices[face[3]], appliedVertices[face[0]])
		const vTop = vec3Sub(appliedVertices[face[1]], appliedVertices[face[0]])
		const cross = vec3Cross(vLeft, vTop)
		
		if (cross[1] < 1e-10)
			continue
		const pattern = context.createPattern(sides[i].image, "no-repeat");
		const e = projectedVertices[face[0]].x
		const f = projectedVertices[face[0]].y
		const a = (projectedVertices[face[1]].x - e) / 100;
		const b = (projectedVertices[face[1]].y - f) / 100;
		const c = (projectedVertices[face[3]].x - e) / 100;
		const d = (projectedVertices[face[3]].y - f) / 100;

		pattern.setTransform(new DOMMatrix([ a, b, c, d, e, f ]))

  	context.fillStyle = pattern
		context.beginPath()
		for (const idx of face) {
			context.lineTo(projectedVertices[idx].x, projectedVertices[idx].y)
		}
		context.closePath()
		//context.stroke()
		context.fill()
	}
}

function projectOrtho(vector) {
	return {x: vector[0], y: vector[2]}
}