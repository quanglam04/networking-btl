import useLoginHook from './useLoginHook'
import { Button, Form, Input } from 'antd'

const { Item: FormItem } = Form

const LoginPage = () => {
  const { handleLogin, form } = useLoginHook()
  return (
    <div className='flex h-screen items-center justify-center bg-gray-50'>
      <div className='flex w-[300px] flex-col items-center justify-center rounded-2xl border border-gray-300 bg-white p-6 shadow-lg'>
        <Form form={form} layout='vertical' className='w-full'>
          <FormItem label='Tài khoản' name='username'>
            <Input className='!w-full' />
          </FormItem>

          <FormItem label='Mật khẩu' name='password'>
            <Input.Password className='!w-full' />
          </FormItem>

          <Button type='primary' block onClick={handleLogin}>
            Đăng nhập
          </Button>
        </Form>
      </div>
    </div>
  )
}

export default LoginPage
