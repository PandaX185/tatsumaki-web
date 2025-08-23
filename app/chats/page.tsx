"use client";

import FAB from "@/components/fab";
import MessageInput from "@/components/message_input";
import SearchModal from "@/components/search_bar";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Chats() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [userdata, setUserData] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [notifiedChat, setNotifiedChat] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);


    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/users/current`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const json = await res.json();
                setUserData(json);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        if (token) {
            fetchUserData();
        }
    }, [token]);

    const fetchChats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/chats`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const json = await res.json();
            setChats(json);
            return json;
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        }
    };

    useEffect(() => {

        if (token) {
            fetchChats();
        }
    }, [token]);

    useEffect(() => {
        const getChatMessages = async (chatId) => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/messages/${chatId}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const json = await res.json();
                if (json === null) {
                    setChatMessages([]);
                } else {
                    setChatMessages(json);
                }
                return json;
            } catch (error) {
                console.error('Failed to fetch chat messages:', error);
            }
        };

        if (selectedChat) {
            getChatMessages(selectedChat.id);
        }
    }, [selectedChat]);

    useEffect(() => {
        let eventSource = null;

        const getRealtimeMessages = () => {
            eventSource = new EventSource(`${API_BASE_URL}/api/realtime/messages?token=${encodeURIComponent(token)}`);

            eventSource.onopen = (event) => {
                console.log("Connection opened:", event);
            };

            eventSource.addEventListener("msg", (event) => {
                const message = JSON.parse(event.data);
                console.log("Selected chat ID:", selectedChat?.id);
                console.log("New message received:", message);

                if (selectedChat && message.chat_id === selectedChat.id) {
                    setChatMessages(prevMessages => [...prevMessages, message]);
                }

                setChats(prevChats => {
                    if (!prevChats) return prevChats;
                    const targetChat = prevChats.find(chat => chat.id === message.chat_id);
                    if (targetChat && (!selectedChat || message.chat_id !== selectedChat.id)) {
                        setNotifiedChat(message.chat_id);
                    }
                    return prevChats;
                });
            });

            eventSource.onerror = (err) => {
                console.log("EventSource error:", err);
                console.log("ReadyState:", eventSource.readyState);
                if (eventSource.readyState === EventSource.CLOSED) {
                    console.log("Connection closed");
                }
            };
        };

        if (token) {
            getRealtimeMessages();
        }

        return () => {
            if (eventSource) {
                console.log("Closing EventSource connection");
                eventSource.close();
            }
        };
    }, [token, selectedChat]);

    const handleSearch = async (query) => {
        if (!query || query.trim() === "") {
            setSearchResults([]);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${query}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const json = await res.json();
            console.log("Search results:", json);
            if (json === null) {
                setSearchResults([]);
            } else {
                setSearchResults(json);
            }
            return json;
        } catch (error) {
            console.error('Failed to fetch search for user:', error);
        }
    };

    const handleUserSelect = (user) => {
        console.log("Selected user:", user);
        setSelectedUsers((prevSelected) => {
            if (prevSelected.some(u => u.id === user.id)) return prevSelected;
            return [...prevSelected, user];
        });
    };

    const handleSendMessage = async (message) => {
        if (!selectedChat) return;

        try {
            console.log(userdata);
            const res = await fetch(`${API_BASE_URL}/api/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    chat_id: selectedChat.id,
                    sender_id: +userdata.id,
                    content: message
                })
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const json = await res.json();
            console.log("Message sent:", json);
            return json;
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <div className="w-full h-screen gap-4 bg-black text-blue-300 font-mono text-4xl flex justify-center items-center">
            <div className="flex w-full h-screen gap-4">
                <div className="w-1/3 h-screen px-6 py-8 flex flex-col gap-3 items-start justify-start bg-gray-900 relative">
                    <h1 className="text-gray-100 text-4xl">Hello, {userdata?.full_name} ({userdata?.user_name})!</h1>
                    <div className="flex-1 overflow-y-auto w-full">
                        <ul>
                            {
                                chats && chats.length > 0 ? chats.map(chat => (
                                    chat.id === notifiedChat ? (
                                        <div className="flex gap-2" key={chat.id}>
                                            <li className="text-gray-200 font-bold my-3">
                                                <a href="#" onClick={() => {
                                                    setSelectedChat(chat);
                                                    setNotifiedChat(null);
                                                }}>{chat.chat_name}</a>
                                            </li>
                                            <p className="text-red-300">NEW</p>
                                        </div>
                                    ) : (
                                        <li key={chat.id} className="text-gray-200 my-3">
                                            <a href="#" onClick={() => {
                                                if (chat.id == notifiedChat) setNotifiedChat(null);
                                                setSelectedChat(chat);
                                            }}>{chat.chat_name}</a>
                                        </li>
                                    )
                                )) : <h2 className="text-gray-400">Your chats will appear here.</h2>
                            }
                        </ul>
                    </div>

                    <FAB onClick={() => setShowModal(true)} />

                    {showModal && (
                        <SearchModal
                            show={showModal}
                            onClose={async () => {
                                setShowModal(false);
                                setSearchResults([]);
                                setSelectedUsers([]);
                                fetchChats().then((chats) => {
                                    if (chats && chats.length > 0) {
                                        setSelectedChat(chats[0]);
                                    }
                                });
                            }}
                            onSearch={handleSearch}
                            searchResults={searchResults}
                            onUserSelect={handleUserSelect}
                            selectedUsers={selectedUsers}
                            token={token}
                        />
                    )}
                </div>
                <div className="flex flex-col space-between h-screen w-2/3 bg-gray-900 p-6">
                    <div className="w-full h-screen flex flex-col-reverse">
                        <div className="flex-1 overflow-y-auto">
                            {selectedChat ? (
                                <>
                                    <h2 className="text-gray-100 text-2xl mb-4">{selectedChat?.chat_name}</h2>
                                    {chatMessages.length > 0 ? (
                                        <ul>
                                            {chatMessages.map(message => (
                                                <li key={message.id} className="text-gray-200 my-2">
                                                    <strong>{message.sender_id}:</strong> {message.content}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-gray-400">No messages.</div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <h2 className="text-gray-100 text-2xl mb-4">Chat Messages</h2>
                                    <div className="text-gray-400">Select a chat to view messages.</div>
                                </>
                            )}
                        </div>
                    </div>
                    <MessageInput onSendMessage={handleSendMessage} token={token} chatId={selectedChat?.id} />
                </div>
            </div>
        </div>
    );
}