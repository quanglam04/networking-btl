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

  /**
   * Hiển thị thông báo loading, không tự động tắt.
   * @param message Tiêu đề
   * @param description Mô tả (ví dụ: % hoàn thành)
   * @param key ID duy nhất để cập nhật hoặc đóng thông báo này
   */
  const showLoading = (message: string, description: string) => {
    notification.info({
      message,
      description,
      placement: 'top',
      duration: 0 // 0 = không tự động đóng
    })
  }
  return { showSuccess, showError , showLoading}
}
export default useNotificationHook
