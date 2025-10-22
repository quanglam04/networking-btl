import 'dotenv/config'
import express from 'express'
import { connectDB } from './config/db.config'
import './models/User'
import './models/Message'
import './models/Conversation'
import { userRouter } from './routes/user.routes'

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use('/api/user', userRouter)

const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`))
}

startServer()
