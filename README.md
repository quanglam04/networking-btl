# Introduction:

Dự án là Bài tập lớn kết thúc môn Lập trình Mạng, với mục tiêu thiết kế và xây dựng một hệ thống ứng dụng truyền thông mạng hoàn chỉnh, có khả năng xử lý giao tiếp đa người dùng một cách hiệu quả và tức thời.

Ứng dụng được chọn phát triển là một Chat Application Real-time, mô phỏng nền tảng nhắn tin hiện đại, nơi người dùng có thể trao đổi thông tin với độ trễ tối thiểu, làm nổi bật vai trò của các giao thức và kỹ thuật lập trình mạng trong môi trường thực tế.

## Project Structure

```
src/
├── frontend/                # Client-side application (React, etc.)
│   ├── app/
│   │   ├── layout/        # Layout components
│   │   ├── pages/         # Page components and routing
│   │   ├── styles/        # Global styles and theme
│   │   ├── App.tsx        # Root component
│   │   ├── index.tsx      # Entry point
│   │   └── router.tsx     # Router configuration
│   ├── assets/            # Static assets
│   │   ├── fonts/         # Project fonts configuration
│   │   └── images/        # Project images configuration
│   ├── services/          # API services and external integrations (Frontend-specific)
│   └── shared/            # Shared modules and utilities (Frontend-specific)
│       ├── components/    # Reusable UI components
│       ├── constants/     # Application constants (Frontend-specific)
│       ├── contexts/      # Global context (e.g., themeContext, languageContext, loadingContext)
│       ├── services/      # Common services (e.g., StorageService, Config Interceptor)
│       ├── hooks/         # Common hooks (e.g., useDarkMode, useLoading)
│       ├── types/         # TypeScript type definitions (Frontend-specific)
│       └── utils/         # Utility functions (Frontend-specific)
└── backend/             # Server-side application (Node/Express, etc.)
  ├── controllers/       # Handle API logic, call services
  ├── middlewares/       # Express middlewares (authentication, error handling, etc.)
  ├── models/             # Define schema/data models (ORM or plain)
  ├── routes/             # Define endpoints and map to corresponding controllers
  ├── services/           # Contain business logic
  ├── sockets/           # Handle WebSocket connections and logic (e.g., Socket.IO)
  ├── shared/             # Shared modules and utilities (Backend-specific)
  │   ├── constants/     # Application constants (Backend-specific)
  │   └── utils/         # Utility functions (Backend-specific)
  ├── config/             # Configuration files for the server, DB, environment, etc.
  ├── guiline.txt         # Internal notes or project guidelines
  ├── index.ts           # Entry point to start the server application
  └── type.d.ts           # Define custom types for TypeScript (Backend-specific)
```

## Prerequisites

- Node.js (Version 18 or higher)
- npm or yarn

## Installation

1. Clone the repository

```bash
git clone [repository-url]
```

2. Run the Frontend Application

The frontend application is typically found in the `frontend` directory

- Navigate to the frontend source code directory:

```bash
cd frontend
```

- Install dependencies:

```bash
npm install
```

- Start the development server:

```bash
npm run dev
```

3. Run the Backend Application

The backend application is typically found in the `backend` directory

- Navigate to the backend source code directory:

```bash
cd backend
```

- Install dependencies:

```bash
npm install
```

- Start the development server:

```bash
npm run dev
```

## Member

- Trịnh Quang Lâm
- Vũ Nhân Kiên
- Cao Thị Thu Hương

## Overall
