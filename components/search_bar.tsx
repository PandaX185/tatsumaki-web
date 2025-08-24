
import { useState } from "react";

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface User {
    id: number | string;
    username: string;
    fullname: string;
}

interface SearchModalProps {
    show: boolean;
    onClose: (newChat?: any) => void;
    onSearch: (query: string) => void;
    searchResults: User[];
    onUserSelect: (user: User) => void;
    selectedUsers: User[];
    token: string;
}

export default function SearchModal({ show, onClose, onSearch, searchResults, onUserSelect, selectedUsers, token }: SearchModalProps) {
    const [chatName, setChatName] = useState("");
    const [error, setError] = useState("");
    if (!show) return null;

    const handleStartChat = async () => {
        setError("");
        if (selectedUsers.length === 0) {
            setError("No users selected");
            return;
        }
        if (chatName.trim() === "") {
            setError("Chat name is required");
            return;
        }
        try {
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
            const text = await res.text();
            if (!res.ok) {
                setError("Failed to start chat");
                return;
            }
            if (text) {
                try {
                    const json = JSON.parse(text);
                    onClose(json);
                } catch (e) {
                    setError("Error parsing response");
                }
            } else {
                setError("Chat started, but no response body.");
            }
        } catch (e) {
            setError("Network error");
        }
    };

    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
            <div className="flex flex-col bg-area p-8 rounded-lg shadow-lg w-full max-w-md relative overflow-auto">
                <button
                    className="absolute top-1 right-2 !bg-transparent hover:!text-foreground !text-2xl"
                    onClick={() => onClose()}
                    aria-label="Close"
                >
                    &times;
                </button>
                <div className="flex flex-wrap gap-2 mb-4">
                    {selectedUsers.map(user => (
                        <span
                            key={user.id}
                            className="bg-main cursor-pointer px-3 py-1 rounded-full text-sm flex items-center"
                            onClick={() => onUserSelect(user)}
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
                                <li key={user.id} className="hover:text-main my-2 cursor-pointer" onClick={() => onUserSelect(user)}>
                                    {user.fullname} ({user.username})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-error">No results.</div>
                    )}
                </div>
                <input
                    type="text"
                    placeholder="Chat name"
                    value={chatName}
                    onChange={e => setChatName(e.target.value)}
                    className="w-full px-3 py-2 mt-4 rounded bg-input-bg text-chat-message-text border-2 border-input-border"
                    required
                />
                {error && <div className="text-error text-lg mt-2">{error}</div>}
                <button
                    className="bg-button-login cursor-pointer text-chat-message-text mt-4 px-8 py-4 rounded-full hover:bg-button-login-hover hover:scale-105 transition-all duration-300 ease-in-out"
                    onClick={handleStartChat}
                >
                    Start Chat
                </button>
            </div>
        </div>
    );
}

interface SearchBarProps {
    onSearch: (query: string) => void;
}

function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form className="search-bar flex gap-5 items-center w-full" onSubmit={handleSearch}>
            <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Find a user..."
                className="w-full px-3 py-2 rounded bg-input-bg text-chat-message-text border-2 border-input-border"
                required
            />
            <button type="submit" style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0,0,256,256">
                    <g fill="currentColor" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: "normal" }}>
                        <g transform="scale(5.12,5.12)">
                            <path d="M21,3c-9.37891,0 -17,7.62109 -17,17c0,9.37891 7.62109,17 17,17c3.71094,0 7.14063,-1.19531 9.9375,-3.21875l13.15625,13.125l2.8125,-2.8125l-13,-13.03125c2.55469,-2.97656 4.09375,-6.83984 4.09375,-11.0625c0,-9.37891 -7.62109,-17 -17,-17zM21,5c8.29688,0 15,6.70313 15,15c0,8.29688 -6.70312,15 -15,15c-8.29687,0 -15,-6.70312 -15,-15c0,-8.29687 6.70313,-15 15,-15z"></path>
                        </g>
                    </g>
                </svg>
            </button>
        </form>
    );
}
