import { Request, Response } from 'express'
import User from '~/models/User'
import HTTPStatus from '~/shared/constants/httpStatus'
import logger from '~/shared/utils/log'
import * as jwt from 'jsonwebtoken'
const test = (req: Request, res: Response) => {
  res.json({ message: 'OK' })
}

const register = async (req: Request, res: Response) => {
  logger.info('Đăng ký người dùng mới')
  try {
    const { username, password } = req.body
    const existingUser = await User.findOne({ username })

    if (existingUser) {
      logger.warn(`Lỗi đăng ký: Tên người dùng "${username}" đã tồn tại.`)
      return res.status(HTTPStatus.CONFLICT).json({
        status: HTTPStatus.CONFLICT,
        message: 'Tên người dùng đã tồn tại.',
        data: null
      })
    }

    const newUser = new User({
      username: username,
      password: password
    })

    const savedUser = await newUser.save()
    logger.info(`Đăng ký thành công người dùng ID: ${savedUser._id}`)
    res.status(HTTPStatus.CREATED).json({
      status: HTTPStatus.CREATED,
      message: 'Đăng ký thành công',
      data: {
        id: savedUser._id,
        username: savedUser.username
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    logger.error('Lỗi khi đăng ký người dùng:', e)

    if (e.name === 'ValidationError') {
      return res.status(HTTPStatus.BAD_REQUEST).json({
        status: HTTPStatus.BAD_REQUEST,
        message: e.message || 'Dữ liệu đăng ký không hợp lệ.',
        data: null
      })
    }
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
      status: HTTPStatus.INTERNAL_SERVER_ERROR,
      message: 'Lỗi máy chủ nội bộ trong quá trình đăng ký.',
      data: null
    })
  }
}

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body
  logger.info(`User [${username}] đăng nhập vào hệ thống`)
  if (!username || !password) {
    return res.status(HTTPStatus.BAD_REQUEST).json({
      status: HTTPStatus.BAD_REQUEST,
      message: 'Vui lòng cung cấp đầy đủ tên đăng nhập và mật khẩu.'
    })
  }
  try {
    const user = await User.findOne({ username: username })
    if (!user) {
      return res.status(HTTPStatus.UNAUTHORIZED).json({
        status: HTTPStatus.UNAUTHORIZED,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng.'
      })
    }
    const isPasswordValid = password === user.password
    if (!isPasswordValid) {
      return res.status(HTTPStatus.UNAUTHORIZED).json({
        status: HTTPStatus.UNAUTHORIZED,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng.'
      })
    }
    const Payload = {
      id: user.id,
      username: user.username,
      status: 'online',
      lastSeen: user.lastSeen
    }
    const access_token = jwt.sign(Payload, process.env.JWT_SECRET as string, {
      expiresIn: '1d'
    })
    return res.status(HTTPStatus.OK).json({
      status: HTTPStatus.OK,
      message: 'Đăng nhập thành công',
      data: {
        access_token: access_token,
        user_info: Payload
      }
    })
  } catch (error) {
    console.error('Lỗi đăng nhập:', error)
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
      status: HTTPStatus.INTERNAL_SERVER_ERROR,
      message: 'Đã xảy ra lỗi hệ thống.'
    })
  }
}

const logout = (req: Request, res: Response) => {}

export { test, register, login, logout }
