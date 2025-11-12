import 'dotenv/config'
import express from 'express'
import { clearConversationAndMessage, clearDataUsers, connectDB } from './config/db.config'
import cors from 'cors'
import http from 'http'
import { userRouter } from './routes/user.routes'
import { conversationRouter } from './routes/conversation.routes'
import { messageRouter } from './routes/message.routes'
import { createSocketServer } from './config/socket.config'
import { setupSocket } from './sockets'
import { setupApp } from './config/app.config'
import { fixIndex } from './scripts/fixIndex'
import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'

const PORT = process.env.PORT || 5000
const app = express()

// setup express app
setupApp(app)

// --- THÊM LOGIC STATIC FILE ---
// Code này biến thư mục 'public' thành thư mục có thể truy cập qua web
// Ví dụ: file 'public/uploads/file.png' sẽ truy cập được qua URL '/public/uploads/file.png'
const publicPath = path.resolve(__dirname, '../public/uploads') // Sửa: Thêm /uploads

if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true })
}
app.use('/public/uploads', express.static(publicPath))

// Đăng ký routes
app.use('/api/user', userRouter)
app.use('/api/message', messageRouter)
app.use('/api/conversations', conversationRouter)

const server = http.createServer(app)
const io = createSocketServer(server)

//set up server socket
setupSocket(io)

const startServer = async () => {
  await connectDB()
  // await fixIndex()
  // await clearDataUsers()
  // await clearConversationAndMessage()
  // await mongoose.connection.dropDatabase()
  server.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`))
}

startServer()
