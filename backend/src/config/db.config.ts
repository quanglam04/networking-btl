import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL as string, {
      dbName: 'chat-app'
    })
    console.log(process.env.DB_URL as string)
    console.log('Kết nối thành công')
  } catch (error) {
    console.log(process.env.DB_URL as string)
    console.error(error)
    process.exit(1)
  }
}
