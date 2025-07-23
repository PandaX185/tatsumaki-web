"use client";

import { useSearchParams } from "next/navigation";

export default function Chats() {
    const searchParams = useSearchParams();

    const username = searchParams.get("username");
    const fullname = searchParams.get("fullname");
    return <div className="w-full h-screen flex items-center justify-center bg-black">
        <h1 className="text-gray-100 text-4xl">Hello, {fullname}</h1>
    </div>;
}