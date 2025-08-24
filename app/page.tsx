'use client';

import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const json = await res.json();
      if (!res.ok || json.code > 200) {
        setError(json.message || "Login failed");
        return;
      }
      router.push(`/chats?token=${encodeURIComponent(json.access_token)}`);
    } catch (err) {
      setError("Network error");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isRegistering) {
      setIsRegistering(true);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, fullname })
      });
      const json = await res.json();
      if (!res.ok || json.code > 200) {
        setError(json.message || "Registration failed");
        return;
      }
      router.push(`/chats?token=${encodeURIComponent(json.access_token)}`);
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="flex flex-col gap-10">
        <h1>Tatsumaki Chat</h1>
        <form className="flex flex-col gap-5" onSubmit={isRegistering ? handleRegister : handleLogin}>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            className="px-3 py-2 border-2 rounded-md"
            required
          />
          {isRegistering && (
            <input
              type="text"
              value={fullname}
              onChange={e => setFullname(e.target.value)}
              placeholder="Full name"
              className="px-3 py-2 border-2 rounded-md"
              required
            />
          )}
          <div className="relative">
            <input
              type={isPasswordVisible ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="px-3 py-2 border-2 rounded-md pr-10"
              required
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <FontAwesomeIcon icon={isPasswordVisible ? faEye : faEyeSlash} />
            </span>
          </div>
          {error && <div className="text-red-400">{error}</div>}
          <div className="flex flex-col gap-4 w-full">
            <button
              type="button"
              onClick={handleLogin}
            >
              Login
            </button>
            <button
              type="button"
              onClick={handleRegister}
              className="w-full register-button"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}