// Sửa file: backend/src/sockets/handlers/file.handler.ts
// (File này tôi đã cung cấp ở bước trước, giờ tôi cập nhật nó)

import { Server, Socket } from 'socket.io'
import Message from '~/models/Message'
import User from '~/models/User'
import Conversation from '~/models/Conversation'
import fs from 'fs'
import path from 'path'
import { JwtPayload } from 'jsonwebtoken' // Thêm import

// --- THÊM GIỚI HẠN FILE ---
const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
// ---------------------------

// Cấu trúc tạm để lưu các file đang upload dở
const fileUploads = new Map<
  string,
  {
    chunks: Buffer[]
    fileSize: number
    metadata: {
      receiverUsername: string
      fileName: string
      fileType: string
    }
  }
>()

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.resolve(__dirname, '../../../public/uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

export const fileHandler = (io: Server, socket: Socket) => {
  const senderId = (socket.data.user as JwtPayload).userId // Sửa lại: Lấy từ socket.data
  const senderUsername = (socket.data.user as JwtPayload).username // Sửa lại: Lấy từ socket.data

  /**
   * 1. Bắt đầu upload: Client thông báo chuẩn bị gửi file
   */
  socket.on(
    'file:start',
    (
      payload: {
        receiverUsername: string
        fileName: string
        fileType: string
        fileSize: number
      },
      callback: (response: { success: boolean; message: string }) => void // Thêm callback
    ) => {
      // --- THÊM KIỂM TRA KÍCH THƯỚC FILE ---
      if (payload.fileSize > MAX_FILE_SIZE_BYTES) {
        return callback({
          success: false,
          message: `File quá lớn. Kích thước tối đa là ${MAX_FILE_SIZE_MB}MB.`
        })
      }
      // ---------------------------------

      console.log(`[File] ${senderUsername} bắt đầu gửi file: ${payload.fileName}`)
      fileUploads.set(socket.id, {
        chunks: [],
        fileSize: payload.fileSize,
        metadata: {
          receiverUsername: payload.receiverUsername,
          fileName: payload.fileName,
          fileType: payload.fileType
        }
      })
      callback({ success: true, message: 'Sẵn sàng nhận file' })
    }
  )

  /**
   * 2. Nhận chunk: Client gửi từng mẩu file
   */
  socket.on(
    'file:chunk',
    (
      payload: { chunk: Buffer },
      callback: (response: { success: boolean; progress?: number; message?: string }) => void
    ) => {
      const uploadState = fileUploads.get(socket.id)
      if (!uploadState) {
        return callback({ success: false, message: 'Lỗi: Chưa bắt đầu upload.' })
      }

      uploadState.chunks.push(payload.chunk)
      const receivedSize = uploadState.chunks.reduce((acc, chunk) => acc + chunk.length, 0)

      // Kiểm tra lần nữa, đề phòng client gửi lố
      if (receivedSize > MAX_FILE_SIZE_BYTES) {
        fileUploads.delete(socket.id) // Hủy upload
        return callback({ success: false, message: 'Lỗi: Vượt quá kích thước file.' })
      }

      const progress = (receivedSize / uploadState.fileSize) * 100
      callback({ success: true, progress: parseFloat(progress.toFixed(2)) })
    }
  )

  /**
   * 3. Kết thúc upload: Client báo đã gửi xong
   */
  socket.on(
    'file:end',
    async (callback: (response: { success: boolean; message: string; data?: any }) => void) => {
      const uploadState = fileUploads.get(socket.id)
      if (!uploadState) {
        return callback({ success: false, message: 'Lỗi: Upload chưa bắt đầu.' })
      }

      const { receiverUsername, fileName, fileType } = uploadState.metadata
      console.log(`[File] ${senderUsername}: Nhận xong file ${fileName}. Đang xử lý...`)

      try {
        const fileBuffer = Buffer.concat(uploadState.chunks)

        // Kiểm tra kích thước cuối cùng
        if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
          throw new Error(`File quá lớn. Kích thước tối đa là ${MAX_FILE_SIZE_MB}MB.`)
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const extension = path.extname(fileName)
        const uniqueFileName = `${senderId}-${uniqueSuffix}${extension}`
        const filePath = path.join(uploadDir, uniqueFileName)
        fs.writeFileSync(filePath, fileBuffer)

        const fileUrl = `/public/uploads/${uniqueFileName}`

        // Logic tìm/tạo conversation và message (giống message.handler.ts)
        const receiver = await User.findOne({ username: receiverUsername })
        if (!receiver) {
          throw new Error('Không tìm thấy người nhận')
        }

        let conversation = await Conversation.findOne({
          participants: { $all: [senderId, receiver._id] }
        })
        if (!conversation) {
          conversation = await Conversation.create({
            participants: [senderId, receiver._id],
            readStatus: [ // Thêm readStatus khi tạo mới
              { userId: senderId, lastReadMessageId: null },
              { userId: receiver._id, lastReadMessageId: null }
            ]
          })
        }

        const message = await Message.create({
          conversationId: conversation._id,
          senderId: senderId,
          type: fileType.startsWith('image') ? 'image' : 'file',
          content: fileName,
          media: [
            {
              url: fileUrl,
              mimeType: fileType,
              fileName: fileName
            }
          ],
          timestamp: new Date()
        })

        await Conversation.findByIdAndUpdate(conversation._id, {
          lastMessageId: message._id
        })

        await message.populate('senderId', 'username status')

        io.to(conversation._id.toString()).emit('receive-message', {
          message,
          conversationId: conversation._id
        })

        callback({ success: true, message: 'Gửi file thành công', data: message })
      } catch (error: any) {
        console.error(`[File] Lỗi khi xử lý file từ ${senderUsername}:`, error)
        callback({ success: false, message: error.message })
      } finally {
        fileUploads.delete(socket.id)
      }
    }
  )
}

/**
 * Hàm dọn dẹp khi người dùng ngắt kết nối
 */
export const cleanupFileUploads = (socketId: string) => {
  if (fileUploads.has(socketId)) {
    fileUploads.delete(socketId)
    console.log(`[File] Đã dọn dẹp upload dở của socket ${socketId}`)
  }
}