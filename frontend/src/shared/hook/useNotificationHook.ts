import { notification } from 'antd'

const useNotificationHook = () => {
  const showSuccess = (message: string) => {
    notification.success({
      message: message,
      placement: 'top',
      duration: 1
    })
  }

  const showError = (message: string) => {
    notification.error({
      message: message,
      placement: 'top',
      duration: 1
    })
  }
  return { showSuccess, showError }
}
export default useNotificationHook
