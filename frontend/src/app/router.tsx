// src/app/router.tsx

import type { RouteObject } from 'react-router-dom'
import ChatPage from './pages/chat/chat-page'
import LoginPage from './pages/auth/login-page'
import RegisterPage from './pages/auth/register-page'
import NotFoundPage from './pages/not-found'
// Import các trang đã tạo

// Lưu ý: Đảm bảo đường dẫn import trên đây là chính xác với cấu trúc thực tế của bạn.

const router: RouteObject[] = [
  {
    path: '/',
    children: [
      {
        // Trang chủ mặc định là trang chat
        index: true,
        element: <ChatPage />
      },
      {
        // Định tuyến cho trang Đăng nhập
        path: 'login',
        element: <LoginPage />
      },
      {
        // Định tuyến cho trang Đăng ký
        path: 'register',
        element: <RegisterPage />
      },
      {
        // Định tuyến Catch-all cho trang 404
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]

export { router }
