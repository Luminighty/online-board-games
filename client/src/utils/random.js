export function createShuffleSeed(length) {
	const seed = []
	for (let i = length - 1; i >= 0; i--)
		seed[i] = Math.floor(Math.random() * (i + 1))
	return seed
}


/**
 * @param {number} maxValue Maximum number EXCLUSIVE that the sequence has
 * @param {number} length 
 */
export function generateSequence(maxValue, length) {
	const seq = []
	seq.length = length
	for (let index = 0; index < seq.length; index++)
		seq[index] = Math.floor(Math.random() * maxValue)
	return seq
}

export function shuffleApply(array, seed) {
	for (let i = array.length - 1; i >= 0; i--) {
		const j = seed[i]
		const temp = array[i]
		array[i] = array[j]
		array[j] = temp
	}
}