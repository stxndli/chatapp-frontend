export interface Message {
  room: number,
  from: string,
  content: string,
  sent_at?: string
}
export interface Room {
  roomId: number,
  name: string,
  lastMessage: Message,
}
