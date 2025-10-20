import http from '@/shared/services/http.service'
import type { ApiResponse } from '@/shared/types/http.type'
import type { LoginRequest, LoginResponse } from '@/shared/types/auth.type'

class _ClientService {
  async login(payload: LoginRequest) {
    const response = await http.post<ApiResponse<LoginResponse>>('/auth/login', payload)
    return response
  }
}
const clientService = new _ClientService()

export default clientService
