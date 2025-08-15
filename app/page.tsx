'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("")
  const [fullname, setFullname] = useState("")
  const [password, setPassword] = useState("")
  const [registerState, setRegisterState] = useState(false);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  async function handleLogin(e) {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_name: username, password })
      });
      const json = await res.json()
      if (json.code > 200) {
        console.log(json);
        return;
      }
      router.push(`/chats?token=${encodeURIComponent(json.access_token)}`)
    } catch (err) {
      console.log(err);
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (registerState) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ user_name: username, password, full_name: fullname })
        });
        const json = await res.json()
        if (json.code > 200) {
          console.log(json);
          return;
        }
        router.push(`/chats?token=${encodeURIComponent(json.access_token)}`)
      } catch (err) {
        console.log(err);
      }
    } else setRegisterState(true);
  }

  return <div className="w-full h-screen bg-black text-blue-300 font-mono text-4xl flex justify-center items-center">
    <div className="flex flex-col gap-10">
      <h1>Tatsumaki Chat</h1>
      <form method="post" className="flex flex-col gap-5">
        <input type="text" value={username} onChange={(e) => {
          setUsername(e.target.value)
        }} placeholder="Username" className="px-3 py-2 border-2 rounded-md" />
        {
          registerState ? <input type="text" value={fullname} onChange={(e) => {
            setFullname(e.target.value)
          }} placeholder="Full name" className="px-3 py-2 border-2 rounded-md" /> : <div></div>
        }
        <input type="password" value={password} onChange={(e) => {
          setPassword(e.target.value)
        }} placeholder="Password" className="px-3 py-2 border-2 rounded-md" />
        <input type="button" onClick={handleLogin} value="Login" className="px-4 py-3 border-2 rounded-md" />
        <input type="button" onClick={handleRegister} value="Register" className="px-4 py-3 border-2 rounded-md" />
      </form>
    </div>
  </div >
}
