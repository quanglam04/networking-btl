export interface Message {
  id: number
  sender: string
  content: string
  type: 'text' | 'file'
  isMe: boolean
  senderName: string
}
