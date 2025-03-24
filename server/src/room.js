import { Socket } from "socket.io"

const id = (() => {
	let last = 0
	return () => `${last++}${Date.now().toString(16)}`
})()

export class GameRoom {
	/** @param {Socket} owner */
	constructor(owner) {
		this.owner = owner
		/** @type {Socket[]} */
		this.clients = []
		this.id = id()
		GameRooms.set(this.id, this)
	}

	join(socket) {
		this.clients.push(socket)
	}

	leave(socket) {
		if (this.owner.id === socket.id) {
			if (this.clients.length === 0) {
				console.info("No more users, closing ", this.id)
				this.close()
				return
			}
			this.owner = this.clients.shift()
		} else {
			const index = this.clients.findIndex((s) => s.id === socket.id)
			if (index < 0) {
				console.warn("User not found in room! ", socket.id);
				return
			}
			this.clients.splice(index, 1)
		}
	}

	close() {
		GameRooms.delete(this.id)
		delete this
	}
}

export const GameRooms = new Map()
