import clientService from '@/services/client.service'
import socketService from '@/services/socket.service'
import useNotificationHook from '@/shared/hook/useNotificationHook'
import type { Message } from '@/shared/types/chat.type'
import { readChunkAsBase64 } from '@/shared/utils/readChunkAsBase64'
import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'

const useChatWindowHook = () => {
  const { conversationId } = useParams<{ conversationId: string }>()
  const location = useLocation()
  const { username: receiverUsername, userId: receiverId, status } = location.state || {}
  const CHUNK_SIZE = 64 * 1024 // 64KB mỗi chunk
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { showError } = useNotificationHook()

  const currentUsername = localStorage.getItem('userName')

  // Load messages
  const loadMessages = async () => {
    if (!conversationId) return

    try {
      setLoading(true)
      const response = await clientService.getAllMessageOfConversation(conversationId)
      if (response.status === 200) {
        const messagesData = response.data.data.map((msg: Message) => {
          return {
            ...msg
          }
        })
        setMessages(messagesData)
      }
    } catch (error) {
      showError('Không thể tải tin nhắn')
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  // Setup socket listeners
  useEffect(() => {
    if (!conversationId) return

    // Load messages
    loadMessages()

    // Listen for new messages
    socketService.onReceiveMessage(({ message, conversationId: msgConvId }) => {
      console.log('lắng nghe sự kiện nhận tin nhăn')
      if (msgConvId === conversationId) {
        setMessages((prev) => {
          // Tránh duplicate
          if (prev.some((m) => m.id === message._id)) {
            return prev
          }
          return [
            ...prev,
            {
              ...message,
              isMe: message.senderId.username === currentUsername
            }
          ]
        })
      }
    })

    return () => {
      socketService.off('receive-message')
    }
  }, [conversationId])

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Kiểm tra kích thước
    if (file.size > 10 * 1024 * 1024) {
      showError('File không được vượt quá 10MB')
      return
    }

    if (!receiverUsername) {
      showError('Vui lòng chọn người nhận')
      return
    }

    try {
      setUploadingFile(true)

      // Tạo unique ID cho file upload này
      const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

      console.log('📤 Starting file upload:')
      console.log('   - File ID:', fileId)
      console.log('   - Size:', file.size)
      console.log('   - Total chunks:', totalChunks)

      // Gửi metadata trước
      await socketService.sendFileMetadata({
        fileId,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        totalChunks,
        receiverUsername
      })

      console.log('✅ Metadata sent')

      // Đọc và gửi từng chunk
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, file.size)
        const chunk = file.slice(start, end)

        // Đọc chunk thành base64
        const base64Chunk = await readChunkAsBase64(chunk)

        // Gửi chunk
        await socketService.sendFileChunk({
          fileId,
          chunkIndex,
          totalChunks,
          data: base64Chunk
        })

        console.log(`📦 Sent chunk ${chunkIndex + 1}/${totalChunks}`)

        // Có thể thêm progress bar ở đây
        // setUploadProgress((chunkIndex + 1) / totalChunks * 100)
      }

      // Gửi signal hoàn tất
      await socketService.completeFileUpload({
        fileId,
        receiverUsername
      })

      console.log('✅ File upload completed')
      e.target.value = ''
    } catch (error) {
      showError('Không thể gửi file')
      console.error('Error sending file:', error)
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || !receiverUsername) return

    try {
      await socketService.sendMessage(receiverUsername, inputValue.trim())
      setInputValue('')
    } catch (error) {
      showError('Không thể gửi tin nhắn')
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('ok')
      e.preventDefault()
      handleSend()
    }
  }

  return {
    messages,
    inputValue,
    loading,
    receiverUsername,
    receiverId,
    status,
    messagesEndRef,
    handleInputChange,
    handleSend,
    handleKeyPress,
    handleFileSelect,
    uploadingFile,
    setUploadingFile
  }
}

export default useChatWindowHook
