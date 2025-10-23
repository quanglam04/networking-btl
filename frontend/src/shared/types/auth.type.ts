enum Status {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  access_token: string
  user_info: {
    id: string
    username: string
    status: Status
    lastSeen: Date
  }
}

export type { LoginRequest, LoginResponse }
