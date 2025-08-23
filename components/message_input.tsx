import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function MessageInput({ onSendMessage, token, chatId }) {
    const [message, setMessage] = useState("");

    const handleSendMessage = () => {
        if (message.trim() === "") return;

        onSendMessage(message);
        setMessage("");
    };

    return <div className="flex gap-5">
        <input type="text" placeholder="Type your message..." className="flex-1 p-4 border border-gray-300 rounded-xl" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button onClick={handleSendMessage} className="bg-blue-500 text-white p-4 rounded-full cursor-pointer">
            <FontAwesomeIcon icon={faPaperPlane} size="sm" />
        </button>
    </div>;
}