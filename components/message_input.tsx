import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

interface MessageInputProps {
    onSendMessage: (msg: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
    const [message, setMessage] = useState("");

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() === "") return;
        onSendMessage(message);
        setMessage("");
    };

    return (
        <form className="flex gap-5" onSubmit={handleSendMessage}>
            <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 p-4 border border-gray-300 rounded-xl"
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
            />
            <button
                type="submit"
                className="bg-blue-500 text-white p-4 rounded-full cursor-pointer"
                aria-label="Send message"
            >
                <FontAwesomeIcon icon={faPaperPlane} size="sm" />
            </button>
        </form>
    );
}