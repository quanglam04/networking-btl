import { Server } from 'socket.io'
import http from 'http'
/**
 * Hàm tạo Server socket
 * @param server
 * @returns {Socket.io server}
 */
export const createSocketServer = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.ALLOW_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    },
    maxHttpBufferSize: 1e7 // 10MB (10 * 1024 * 1024)
  })
  return io
}
