import express from 'express'
import { login, logout, register, test } from '~/controllers/user.controller'

export const userRouter = express.Router()

userRouter.get('/test', test)
userRouter.post('/login', login)
userRouter.post('/register', register)
userRouter.post('/logout', logout)
