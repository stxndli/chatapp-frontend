import useAuth from '../hooks/useAuth';
import { Message } from '../typings';
import { useState, useEffect, useRef } from 'react';
interface Props {
  roomId: number | null,
  roomName: string
}
export default function Chatroom({ roomId, roomName }: Props) {
  const { user, socket, token, logout } = useAuth()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const scrollableDiv = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([]);
  const [errorFetching, setErrorFetching] = useState(false)
  const loadPreviousMessages = async () => {
    const headers = {
      headers: {
        'x-access-token': `${token}`
      }
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/messages?room=${roomId}`, headers)
    if (response.status === 200) {
      const previousMessagesData = (await response.json()).data
      setMessages(prevMessages => [...prevMessages, ...previousMessagesData])
    }
  }
  useEffect(() => {
    if (user) {
      setMessages([])
      const headers = {
        headers: {
          'x-access-token': `${token}`
        }
      }
      fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/userInRoom?room=${roomId}`, headers)
        .then(response => {
          if (response.status !== 200) {
            setLoading(false)
            setErrorFetching(true)
          }
          else {
            setErrorFetching(false)
            setLoading(false)
            loadPreviousMessages()

          }
        })

    }
  }, [user, roomId])
  useEffect(() => {
    if (socket) {
      socket.on('message', (message) => {
        const messageObj = JSON.parse(message)
        if (messageObj.room == roomId) {
          setMessages(prevMessages => [...prevMessages, messageObj])
        }
      });

    }
  }, [socket, roomId])
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const messageObj = {
      room: roomId,
      from: user,
      content: message
    }
    if (socket) {
      socket.emit("message", roomId, JSON.stringify(messageObj));
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageObj)
      };

      fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/message`, requestOptions)
    }
    setMessage("")
  };
  useEffect(() => {
    if (scrollableDiv.current)
      scrollableDiv.current.scrollTop = scrollableDiv.current.scrollHeight
  }, [messages]);
  return (
    <>
      <div className="p-5 flex flex-col h-screen space-y-5">
        <div className="flex justify-between">
          <h1 className='text-2xl'>Chat Room: {roomName}</h1>
          <h1 onClick={logout} className="hover:underline cursor-pointer">Logout</h1>
        </div>
        {
          roomId === 0 ? <h1 className="flex h-full justify-center items-center">Click on a room to chat</h1> :
            loading ? <h1 className="flex h-full justify-center items-center">Loading ...</h1> :
              errorFetching ? <h1 className="flex h-full justify-center items-center">Error fetching messages</h1> :
                <div className="flex flex-col flex-1 overflow-y-scroll space-y-5" ref={scrollableDiv} style={{ overflowWrap: "break-word" }}>
                  {messages.map((message, index) => (
                    <p key={index}>{`${message.from}: ${message.content}`}</p>
                  ))}
                </div>
        }
        <form onSubmit={handleSendMessage} className="flex gap-4">
          <input name="message" disabled={loading || errorFetching || roomId === 0} value={message} autoComplete='off' className='w-full rounded-xl focus:outline-none p-2' onChange={(e) => setMessage(e.target.value)} />
          <button className="bg-indigo-600 rounded-lg p-2 font-bold" type="submit">Send</button>
        </form>
      </div>
    </>
  )
}

