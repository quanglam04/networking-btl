import express from 'express'
import { getConversationMessage } from '~/controllers/conversation.controller'
import { authenticateToken } from '~/middlewares/user.middleware'

export const conversationRouter = express.Router()

conversationRouter.get('/:otherUserId/messages', authenticateToken, getConversationMessage)