import { Socket } from "socket.io"
import { GameRoom, GameRooms } from "./room"
import { ResCode } from "./response"


/**
 * @param {Socket} socket 
 */
export function onClient(socket) {
	/** @type {GameRoom} */
	let room

	socket.on("joinRoom", (id, res) => {
		const newRoom = GameRooms.get(id)
		if (!newRoom)
			return res(ResCode.ROOM.RoomNotFound)
		if (room)
			socket.leave(room.id)
		socket.join(room.id)
		room.join(socket)
		return res(ResCode.OK)
	})

	socket.on("createRoom", (res) => {
		room = new GameRoom(socket)
		res(ResCode.OK, room.id)
	})

	socket.on("emit")
	socket.on("sync")
}

