// Sửa file: frontend/src/app/pages/chat/components/chat-input/useChatInputHook.ts

import { useState } from 'react'
import SocketService from '@/services/socket.service' // <-- THÊM IMPORT
import useNotificationHook from '@/shared/hook/useNotificationHook' // <-- THÊM IMPORT

const useChatInputHook = () => {
  const [message, setMessage] = useState('')
  const { showSuccess, showError, showLoading } = useNotificationHook() // <-- SỬ DỤNG HOOK

  // !!! LƯU Ý QUAN TRỌNG: Bạn cần lấy username của người nhận
  // (Ví dụ: từ URL, hoặc từ state của trang chat)
  // Tôi sẽ hardcode ở đây để test
  const currentReceiverUsername = 'gumball' // <-- THAY BẰNG LOGIC CỦA BẠN

  /**
   * Xử lý gửi tin nhắn TEXT
   */
  const handleSend = async () => {
    if (message.trim()) {
      try {
        await SocketService.sendMessage(currentReceiverUsername, message.trim(), 'text')
        setMessage('') // Xóa input khi gửi thành công
      } catch (error) {
        console.error('Lỗi gửi tin nhắn:', error)
        showError('Không thể gửi tin nhắn')
      }
    }
  }

  /**
   * Xử lý khi người dùng CHỌN 1 file
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      showLoading('Đang tải lên file...', `${file.name} (0%)`)

      // Callback để cập nhật thanh tiến trình
      const onProgress = (progress: number) => {
        showLoading('Đang tải lên file...', `${file.name} (${progress}%)`)
      }

      // Gọi service để gửi file
      await SocketService.sendFile(file, currentReceiverUsername, onProgress)

      showSuccess('Gửi file thành công!')
    } catch (error: any) {
      console.error('Lỗi gửi file:', error)
      showError(error.message || 'Gửi file thất bại')
    } finally {
      // Reset input để có thể chọn lại file tương tự
      if (e.target) e.target.value = ''
    }
  }

  // Hàm này không cần nữa, nhưng chúng ta cứ export
  const handleFileAttach = () => {
    console.log('Attaching file...')
  }

  return { handleSend, handleFileAttach, message, setMessage, handleFileSelect }
}
export default useChatInputHook