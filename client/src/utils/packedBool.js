export function packedBooleanGet(packedBool, index) {
	const byteIndex = Math.floor(index / 8)
	const bitIndex = index % 8
	const bit = (packedBool[byteIndex] >> bitIndex) & 1
	return bit === 1
}

export function packBooleans(array) {
	const numBytes = Math.ceil(array.length / 8)
	const packedBool = new Uint8Array(numBytes)

	for (let i = 0; i < array.length; i++) {
		const byteIndex = Math.floor(i / 8)
		const bitIndex = i % 8
		if (array[i]) {
			packedBool[byteIndex] |= (1 << bitIndex)
		}
	}

	return packedBool
}