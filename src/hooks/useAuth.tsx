
import { createContext, SetStateAction, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from 'next/router'
import io, { Socket } from 'socket.io-client';
import { useCookies } from "react-cookie";
interface AuthProviderProps {
  children: React.ReactNode
}
interface IAuth {
  socket: Socket | null,
  user: string | null,
  token: string | null,
  login: (username: string, password: string, setError: (value: SetStateAction<string | null>) => void, signup: boolean) => void,
  logout: () => void,
  redirect: boolean
}

const AuthContext = createContext<IAuth>({
  user: null,
  socket: null,
  token: null,
  login: async () => { },
  logout: () => { },
  redirect: false
})
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [cookies, setCookie, removeCookie] = useCookies()
  const [user, setUser] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [redirect, setRedirect] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()
  const login = async (username: string, password: string, setError: (value: SetStateAction<string | null>) => void, signup: boolean) => {
    setRedirect(true)
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password })
    };
    let response
    if (signup) response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/signup`, requestOptions)
    else response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/login`, requestOptions)
    if (response.status === 200) {
      const data = await response.json()
      setCookie('token', data.token, { path: "/" })
      router.push(`/`)
      setRedirect(false)

    }
    else {
      const error = await response.json()
      setError(error.message)
    }
  }

  const verifyCreds = async (accessToken: string) => {

    const headers = {
      headers: {
        'x-access-token': `${accessToken}`
      }
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/verifyToken`, headers)
    if (response.status === 200) {
      setToken(accessToken!)
      const data = await response.json()
      setUser(data.user.username)
      router.push("/")
      setRedirect(false)
    }
    else {
      setRedirect(true)
      router.push("/login")

    }
    setInitialLoading(false)
  }
  useEffect(() => {
    const accessToken = cookies.token
    if (!accessToken) {
      router.push("/login")
    }
    verifyCreds(accessToken)
  }, [cookies.token])


  useEffect(() => {
    if (user) {
      // initiate socket connection with server
      const socket = io(`${process.env.NEXT_PUBLIC_SERVER_HOST}`, {
        query: {
          user: user
        }
      });
      setSocket(socket)
      socket.on('connect', () => {
        setInitialLoading(false)
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token, user: user, socketId: socket.id })
        };
        fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/userSocket`, requestOptions)
      })
    }
  }, [user])
  const logout = async () => {
    removeCookie('token', { path: "/" })
    setUser(null)
    setRedirect(true)
    router.push("/login")
  }
  const memoedValue = useMemo(() => (
    { user, socket, token, logout, redirect, login }
  ), [user, socket, token, redirect])
  return (
    <AuthContext.Provider value={memoedValue}>
      {initialLoading ?
        <h1>Loading ...</h1> :
        children
      }
    </AuthContext.Provider>
  )
}
export default function useAuth() {
  return useContext(AuthContext)
}
