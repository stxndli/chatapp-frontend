import useAuth from "@/hooks/useAuth"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function Login() {
  const { user, redirect, login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<null | string>(null)
  const router = useRouter()
  const handleSubmit = async (signup: boolean) => {
    if (!username || !password) {
      setError("all input fields are required")
    }
    if (signup) login(username, password, setError, true)
    else login(username, password, setError, false)
  }
  useEffect(() => {
    if (user) router.push("/")
  }, [user])
  return !redirect ? "Loading ..." : (
    <>
      <div className="h-screen flex items-center justify-center">
        <form className="bg-gray-800  py-9 px-14 rounded-lg shadow-md" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-lg font-medium mb-4">Login</h2>
          <p className={`text-red-600 mb-4 ${error ? "" : "hidden"}`}>{error}</p>
          <div className="mb-4">
            <label className="block font-medium mb-2" htmlFor="username"> Username </label>
            <input className="border border-gray-400 p-2 w-full" type="text" id="username" name="username" onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="mb-6">
            <label className="block font-medium mb-2" htmlFor="password"> Password </label>
            <input className="border border-gray-400 p-2 w-full" type="password" id="password" name="password" onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="bg-indigo-500 text-white py-2 px-4 rounded-full hover:bg-indigo-600 mr-4" onClick={() => { handleSubmit(false) }}> Login </button>
          <button className=" text-white py-2 px-4 rounded-full hover:bg-indigo-600" onClick={() => { handleSubmit(true) }}> Signup </button>

        </form>
      </div>
    </>
  )
}
