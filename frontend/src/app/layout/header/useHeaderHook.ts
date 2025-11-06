import clientService from '@/services/client.service'
import useNotificationHook from '@/shared/hook/useNotificationHook'
import storageService from '@/shared/services/storage.service'
import { useNavigate } from 'react-router-dom'

const useHeaderHook = () => {
  const { showSuccess } = useNotificationHook()
  const isLoggedIn = storageService.getAccessTokenFromLS() !== null
  const navigate = useNavigate()
  const goToRegister = () => navigate('/register')
  const goToLogin = () => navigate('/login')
  const handleLogout = async () => {
    await clientService.logout()
    storageService.clear()
    navigate('/login')
    showSuccess('Đăng xuất thành công')
  }
  const test = async () => {
    const response = await clientService.test()
    console.log(response)
  }
  return { isLoggedIn, goToRegister, goToLogin, handleLogout, navigate, test }
}
export default useHeaderHook
