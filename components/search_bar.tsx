import { useState } from "react";

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SearchModal({ show, onClose, onSearch, searchResults, onUserSelect, selectedUsers, token }) {
    if (!show) return null;

    const [chatName, setChatName] = useState("");

    const handleStartChat = async () => {
        if (selectedUsers.length > 0 && chatName.trim() !== "") {
            const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/chats`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    chat_name: chatName,
                    chat_members: selectedUsers.map(user => +user.id)
                })
            });

            if (res.ok) {
                try {
                    const text = await res.text();
                    if (text) {
                        const json = JSON.parse(text);

                    } else {
                        console.error("Chat started successfully, but no response body.");
                    }
                } catch (e) {
                    console.error("Error parsing response:", e);
                }
            } else {
                console.error("Failed to start chat:", res.statusText);
            }
        } else if (chatName.trim() === "") {
            alert("Chat name is required");
        } else {
            alert("No users selected");
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="flex flex-col bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md relative overflow-auto">
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 text-xl"
                    onClick={onClose}
                >
                    &times;
                </button>
                <div className="flex flex-wrap gap-2 mb-4">
                    {selectedUsers && selectedUsers.map(user => (
                        <span
                            key={user.id}
                            className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm flex items-center"
                        >
                            {user.username}
                        </span>
                    ))}
                </div>
                <SearchBar onSearch={onSearch} />
                <div className="mt-4">
                    {searchResults.length > 0 ? (
                        <ul>
                            {searchResults.map(user => (
                                <li key={user.id} className="text-gray-200 my-2 cursor-pointer" onClick={() => onUserSelect(user)}>
                                    {user.fullname} ({user.username})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-gray-400">No results.</div>
                    )}
                </div>
                <input type="text" placeholder="Chat name" value={chatName} onChange={(e) => setChatName(e.target.value)} className="w-full px-3 py-2 mt-4 rounded bg-gray-700 text-gray-200" />
                <button
                    className="bg-blue-500 cursor-pointer text-white mt-4 px-8 py-4 rounded-full hover:bg-blue-600 hover:scale-105 transition-all duration-300 ease-in-out"
                    onClick={handleStartChat}
                >
                    Start Chat
                </button>
            </div>
        </div>
    );
}

function SearchBar({ onSearch }) {
    const [query, setQuery] = useState("");

    const handleSearch = () => {
        onSearch(query);
    };

    return (
        <div className="search-bar flex gap-5 items-center w-full">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a user..."
                className="w-full px-3 py-2 rounded bg-gray-700 text-gray-200"
            />
            <button onClick={handleSearch} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0,0,256,256">
                    <g fill="#ffffff" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: "normal" }}>
                        <g transform="scale(5.12,5.12)">
                            <path d="M21,3c-9.37891,0 -17,7.62109 -17,17c0,9.37891 7.62109,17 17,17c3.71094,0 7.14063,-1.19531 9.9375,-3.21875l13.15625,13.125l2.8125,-2.8125l-13,-13.03125c2.55469,-2.97656 4.09375,-6.83984 4.09375,-11.0625c0,-9.37891 -7.62109,-17 -17,-17zM21,5c8.29688,0 15,6.70313 15,15c0,8.29688 -6.70312,15 -15,15c-8.29687,0 -15,-6.70312 -15,-15c0,-8.29687 6.70313,-15 15,-15z"></path>
                        </g>
                    </g>
                </svg>
            </button>
        </div>
    );
}
