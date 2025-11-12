// Sửa file: frontend/src/app/pages/chat/components/chat-input/index.tsx

import { Input, Button } from 'antd'
import { SendOutlined, PaperClipOutlined } from '@ant-design/icons'
import useChatInputHook from './useChatInputHook'
import { useRef } from 'react' // <-- THÊM IMPORT

const ChatInput: React.FC = () => {
  // --- THÊM VÀ SỬA ---
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { handleSend, message, setMessage, handleFileSelect } = useChatInputHook()

  const onFileAttachClick = () => {
    // Bấm vào nút ghim -> mở cửa sổ chọn file
    fileInputRef.current?.click()
  }
  // --------------------

  return (
    <div className='flex items-center bg-white p-4'>
      {/* --- THÊM INPUT ẨN --- */}
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileSelect} // Gọi hàm xử lý khi chọn file
        className='hidden'
        // Thêm thuộc tính 'multiple' nếu bạn muốn gửi nhiều file
      />
      {/* ---------------------- */}

      <Button
        type='text'
        icon={<PaperClipOutlined className='text-xl' />}
        onClick={onFileAttachClick} // <-- SỬA LẠI HÀM GỌI
        className='mr-2'
      />

      <Input
        placeholder='Nhập tin nhắn...'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onPressEnter={handleSend}
        className='h-10 rounded-full'
      />

      <Button
        type='primary'
        icon={<SendOutlined />}
        onClick={handleSend}
        disabled={!message.trim()} // Chỉ vô hiệu hóa khi không có tin nhắn text
        className='ml-2 flex h-10 w-10 items-center justify-center rounded-full'
      />
    </div>
  )
}

export default ChatInput