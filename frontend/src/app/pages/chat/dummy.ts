import type { Message } from '@/shared/types/chat.type'

const mockMessages: Message[] = [
  { id: 1, sender: 'lanvtn', content: 'Hi', type: 'text', isMe: false, senderName: 'lanvtn' },
  { id: 2, sender: 'quannm', content: 'Hi', type: 'text', isMe: true, senderName: 'quannm' },
  { id: 3, sender: 'lanvtn', content: 'Ok nhe', type: 'text', isMe: false, senderName: 'lanvtn' },
  { id: 4, sender: 'quannm', content: 'Test.csv', type: 'file', isMe: true, senderName: 'quannm' },
  { id: 5, sender: 'lanvtn', content: 'Hello', type: 'text', isMe: false, senderName: 'lanvtn' },
  { id: 6, sender: 'quannm', content: 'globe BB 100d.txt', type: 'file', isMe: true, senderName: 'quannm' }
]

export { mockMessages }
