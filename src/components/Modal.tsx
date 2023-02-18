import MuiModal from "@mui/material/Modal"
import { useRecoilState } from "recoil"
import { modalState } from "../helpers/atoms"
import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import Spinner from "./Spinner";
export default function Modal() {
  const { user, token } = useAuth()
  const [userFound, setUserFound] = useState<boolean | null>(null)
  const [lookingForUser, setLookingForUser] = useState(false)
  const [roomName, setRoomName] = useState("")
  const [userInput, setUserInput] = useState("")
  const [addUsers, setAddUsers] = useState(true)
  const [users, setUsers] = useState<string[]>([user!])
  const [changeButton, setChangeButton] = useState(false)
  const [loading, setLoading] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [show, setShow] = useRecoilState(modalState)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeButton(true)
    setLoading(true)
    const requestOptions = {
      method: 'POST',
      headers: {
        'x-access-token': `${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: roomName, users: users })
    };
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/createRoom`, requestOptions)
    if (response.status === 200) {
      setLoading(false)
      setCreateSuccess(true)
      setTimeout(() => {
        setShow(false)
        setAddUsers(true)
        setChangeButton(false)
        setUsers([user!])
      }, 1000)
    }
    else {
      setLoading(false)
    }

  }
  const checkUser = async (username: string) => {
    if (!username) {
      setUserFound(null)
      return
    }
    setLookingForUser(true)
    const requestOptions = {
      headers: {
        'x-access-token': `${token}`
      }
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_HOST}/user?username=${username}`, requestOptions)
    if (response.status === 200) {
      setUserFound(true)
    }
    else setUserFound(false)
    setLookingForUser(false)

  }
  const addUserToList = (username: string) => {
    setUsers(prevUsers => {
      if (prevUsers.includes(username)) return prevUsers
      return [...prevUsers, username]
    })
    setUserFound(null)
    setUserInput("")
  }
  const handleClose = () => {
    setUsers([`${user}`])
    setAddUsers(true)
    setShow(false)
  }
  return (
    <MuiModal open={show} onClose={handleClose} className="fixed mx-auto my-auto w-[60%] h-[50%]  z-50 ">
      <form className="flex flex-col items-center justify-center rounded-md bg-[#161616]  w-full h-full space-y-8" onSubmit={(e) => e.preventDefault()}>
        <h1 className="text-lg">Create a new chatroom</h1>
        <div className={`${addUsers ? "flex flex-col space-y-5" : "hidden"}`}>
          <div className="relative">
            <input autoComplete="off" type="text" name="users" placeholder="Users" value={userInput} className="p-2 rounded-lg w-full" onChange={(e) => { checkUser(e.target.value); setUserInput(e.target.value) }} />
            {
              lookingForUser ? <Spinner height="16" width="16" className="absolute right-2 top-2" /> :
                userFound ? <span className="absolute right-2 top-2">✅</span> :
                  userFound === false ? <span className="absolute right-2 top-2">❌</span> : ""
            }
          </div>
          <p>{users.length > 1 ? users.toString().replace(`${user}`, 'You') : ""}</p>
          <div className="flex space-x-2">
            <button disabled={lookingForUser || !userFound} className="bg-indigo-600 p-2 font-bold rounded-md w-full" onClick={() => addUserToList(userInput)}>Add</button>
            <button disabled={!users} className="bg-indigo-600 p-2 font-bold rounded-md w-full" onClick={() => users && setAddUsers(false)}>Next</button>
          </div>
        </div>
        <div className={`${addUsers ? "hidden" : "flex flex-col space-y-5"}`}>
          <input autoComplete="off" type="text" name="room" placeholder="Name" className="p-2 rounded-lg" onChange={(e) => setRoomName(e.target.value)} />
          <button type="submit" className="bg-indigo-600 p-2 font-bold rounded-md" disabled={!roomName || loading} onClick={handleSubmit}>
            {
              !changeButton ?
                "Create" :
                loading ?
                  <Spinner height="16" width="16" className="absolute right-2 top-2" /> :
                  createSuccess ?
                    <span>✅</span> :
                    <span>❌</span>
            }
          </button>
        </div>
      </form>
    </MuiModal>
  )
}
