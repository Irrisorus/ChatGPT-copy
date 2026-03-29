import { Attachment } from "./attachment.type"
import { Chat } from "./chat.type"

export type MessageRole = "user" | "assistant" | "system"

export type Message = {
  id: string
  chat_id: string
  role: MessageRole
  content: string
  created_at: string
  message_attachments: Attachment[]
}

export type ChatWithLastMessage = Chat & {
  lastMessage?: Message
}
