export type Chat = {
  id: string
  user_id: string | null
  guest_id: string | null
  title: string | null
  created_at: string
  updated_at: string
  last_message_at: string | null
}
