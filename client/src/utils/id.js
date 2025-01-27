export function idGen() {
	let id = 0
	return () => id++
}

export const id = idGen()