import { io, Socket } from 'socket.io-client'

// Kích thước mỗi mẩu file (chunk). 64KB là kích thước tốt.
// Phải nhỏ hơn maxHttpBufferSize (1MB) bạn cấu hình ở server
const FILE_CHUNK_SIZE = 1024 * 64 // 64KB
const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

class SocketService {
  private socket: Socket | null = null

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token },
      transports: ['websocket']
    })

    this.socket.on('connect', () => {
      console.log('Socket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })

    return this.socket
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  joinConversations(conversationIds: string[]) {
    this.socket?.emit('join-conversations', conversationIds)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendMessage(receiverUsername: string, content: string, type = 'text', media: any[] = []) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.socket?.emit('send-message', { receiverUsername, content, type, media }, (response: any) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }

  sendFile(file: File, receiverUsername: string, onProgress: (progress: number) => void // Callback để cập nhật UI
  ) {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket chưa kết nối'))

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return reject(new Error(`File quá lớn. Kích thước tối đa là ${MAX_FILE_SIZE_MB}MB.`))
      }

      const reader = new FileReader()

      // 1. Đọc file thành ArrayBuffer
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer
        let offset = 0

        // 2. Báo cho server "Tôi chuẩn bị gửi file"
        this.socket?.emit(
          'file:start',
          {
            receiverUsername: receiverUsername,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          },
          // 3. Chờ server phản hồi (qua callback)
          (response: { success: boolean; message: string }) => {
            if (!response.success) {
              return reject(new Error(response.message))
            }

            // 4. Bắt đầu gửi từng mẩu (chunk)
            const sendChunk = () => {
              if (offset >= buffer.byteLength) {
                // 6. Gửi xong, báo cho server
                this.socket?.emit('file:end', (response: { success: boolean; message: string; data?: any }) => {
                  if (response.success) {
                    resolve(response.data) // Gửi file thành công
                  } else {
                    reject(new Error(response.message))
                  }
                })
                return
              }

              const chunk = buffer.slice(offset, offset + FILE_CHUNK_SIZE)
              offset += chunk.byteLength

              // 5. Gửi mẩu file
              this.socket?.emit('file:chunk', { chunk }, (response: { success: boolean; progress: number }) => {
                if (response.success) {
                  onProgress(response.progress) // Cập nhật thanh progress
                  sendChunk() // Gửi chunk tiếp theo
                } else {
                  reject(new Error('Lỗi khi gửi chunk'))
                }
              })
            }
            sendChunk() // Bắt đầu gửi chunk đầu tiên
          }
        )
      }

      reader.onerror = (err) => {
        reject(err)
      }

      reader.readAsArrayBuffer(file)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onReceiveMessage(callback: (data: any) => void) {
    this.socket?.on('receive-message', callback)
  }

  onUsersOnline(callback: (data: { userIds: string[] }) => void) {
    this.socket?.on('users:online', callback)
  }

  onUserOnline(callback: (data: { userId: string }) => void) {
    this.socket?.on('user:online', callback)
  }

  onUserOffline(callback: (data: { userId: string }) => void) {
    this.socket?.on('user:offline', callback)
  }

  off(event: string) {
    this.socket?.off(event)
  }
}

export default new SocketService()
