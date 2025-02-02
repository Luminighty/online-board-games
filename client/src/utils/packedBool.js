const BITS = 8

export function packedBooleanGet(packedBool, index) {
	const byteIndex = Math.floor(index / BITS)
	const bitIndex = index % BITS
	const bit = (packedBool[byteIndex] >> bitIndex) & 1
	return bit === 1
}

export function packBooleans(array) {
	const numBytes = Math.ceil(array.length / BITS)
	const packedBool = new Uint8Array(numBytes)

	for (let i = 0; i < array.length; i++) {
		const byteIndex = Math.floor(i / BITS)
		const bitIndex = i % BITS
		if (array[i]) {
			packedBool[byteIndex] |= (1 << bitIndex)
		}
	}

	return packedBool
}