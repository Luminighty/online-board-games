import { Server } from "socket.io"
import express from "express"
import http from "http"
import { onClient } from "./connection"

const PORT = process.env.PORT ?? 3000

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: 'http://localhost:5173',
		methods: ["GET", "POST"]
	}
})

server.on("connection", onClient)


server.listen(PORT, () => {
	console.log(`Listening on http://localhost:${PORT}`)
})

export const viteNodeApp = app