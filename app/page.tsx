'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault()
    try {

      const res = await fetch("http://127.0.0.1:8080/api/users/login", {
        method: "POST",
        body: JSON.stringify({ user_name: username, password })
      });
      const json = await res.json()
      router.push(`/chats?username=${encodeURIComponent(username)}&fullname=${encodeURIComponent(json.full_name)}`)
    } catch (err) {
      console.log(err);
    }
  }

  return <div className="w-full h-screen bg-black text-blue-300 font-mono text-4xl flex justify-center items-center">
    <div className="flex flex-col gap-10">
      <h1>Tatsumaki Chat</h1>
      <form method="post" className="flex flex-col gap-5">
        <input type="text" value={username} onChange={(e) => {
          setUsername(e.target.value)
        }} placeholder="Username" className="px-3 py-2 border-2 rounded-md" />
        <input type="password" value={password} onChange={(e) => {
          setPassword(e.target.value)
        }} placeholder="Password" className="px-3 py-2 border-2 rounded-md" />
        <input type="button" onClick={handleSubmit} value="Login" className="px-4 py-3 border-2 rounded-md" />
      </form>
    </div>
  </div >
}
