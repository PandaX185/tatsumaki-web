"use client";

import FAB from "@/components/fab";
import MessageInput from "@/components/message_input";
import SearchModal from "@/components/search_bar";
import { time } from "console";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Chats() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [userdata, setUserData] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState([]);
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
                    console.log(res);
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

                if (selectedChat && message.chat_id === selectedChat.id) {
                    setChatMessages(prevMessages => [...prevMessages, message]);
                }

                setChats(prevChats => {
                    if (prevChats) {
                        const targetChat = prevChats.find(chat => chat.id === message.chat_id);
                        if (targetChat && (!selectedChat || message.chat_id !== selectedChat.id)) {
                            setUnreadMessages(prevUnread => {
                                if (!prevUnread) return [message.chat_id];
                                return [...prevUnread, message.chat_id];
                            });
                            return prevChats;
                        }
                    }
                    fetchChats();
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
    }, [token]);

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
        setSelectedUsers((prevSelected) => {
            if (prevSelected.some(u => u.id === user.id)) return prevSelected.filter(u => u.id !== user.id);
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

    const fetchUnreadMessages = async () => {
        let eventSource = null;

        try {
            eventSource = new EventSource(`${API_BASE_URL}/api/realtime/messages/unread?token=${encodeURIComponent(token)}`);

            eventSource.addEventListener("unread", (event) => {
                console.log("Unread messages:", event.data);
                const data = JSON.parse(event.data);
                setUnreadMessages(data);
            });

            eventSource.onerror = (err) => {
                console.log("EventSource error:", err);
                console.log("ReadyState:", eventSource.readyState);
                if (eventSource.readyState === EventSource.CLOSED) {
                    console.log("Connection closed");
                }
            };
        } catch (error) {
            console.error('Failed to fetch unread messages:', error);
        }

        return () => {
            if (eventSource) {
                console.log("Closing EventSource connection");
                eventSource.close();
            }
        };
    }

    useEffect(() => {
        if (token) {
            fetchUnreadMessages();
        }
    }, [token]);

    const markChatAsRead = async (chatId) => {
        const res = await fetch(`${API_BASE_URL}/api/messages/${chatId}/read`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        console.log(res);
        if (!res.ok) {
            console.error('Failed to mark chat as read:', res.statusText);
        }
    };

    return (
        <div className="w-full h-screen gap-4 flex justify-center items-center">
            <div className="flex w-full h-screen gap-4">
                <div className="side-area w-1/3 items-start justify-start relative">
                    <h1>Hello, {userdata?.fullname} ({userdata?.username})!</h1>
                    <div className="flex-1 overflow-y-auto w-full">
                        <ul>
                            {
                                chats && chats.length > 0 ? chats.map(chat => (
                                    unreadMessages && unreadMessages.length > 0 && unreadMessages.map(unreadChat => unreadChat.chat_id).includes(chat.id) && chat.id != selectedChat ? (
                                        <div className="flex gap-2 chat-name" key={chat.id} onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedChat(chat);
                                            markChatAsRead(chat.id);
                                        }}>
                                            <p>{chat.chat_name}</p>
                                            <p className="text-red-300">NEW</p>
                                        </div>
                                    ) : (
                                        <li key={chat.id} onClick={() => {
                                            setSelectedChat(chat);
                                            markChatAsRead(chat.id);
                                        }} className="chat-name">
                                            {chat.chat_name}
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
                                        markChatAsRead(chats[0].id);
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
                {selectedChat ? (
                    <div className="side-area !pt-0 space-between w-2/3">
                        <div className="w-full h-screen flex flex-col">
                            <h1 className="text-center mb-6">{selectedChat?.chat_name}</h1>
                            <div className="flex-1 overflow-y-auto max-h-[80vh]">
                                {chatMessages.length > 0 ? (
                                    <ul>
                                        {chatMessages.map(message => (
                                            <li key={message.id} className="flex items-center gap-4 w-full text-gray-200 my-2 border border-gray-700 px-3 py-1">
                                                <strong className={
                                                    message.sender_id == userdata?.id ? "text-secondary border-r w-1/15 break-words max-w-[70%]" : "text-main border-r w-1/15 break-words max-w-[70%]"
                                                }>{message.username}
                                                </strong>
                                                <div className="flex w-full justify-between items-center">
                                                    <p>
                                                        {message.content}
                                                    </p>
                                                    <div className="flex flex-col items-end">
                                                        <p className="invisible ">{message.content}</p>
                                                        <p className="text-sm text-gray-400 ml-4">
                                                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-gray-400">No messages.</div>
                                )}
                            </div>
                        </div>
                        <MessageInput onSendMessage={handleSendMessage} />
                    </div>
                ) : (
                    <div className="side-area space-between w-2/3 p-6">
                        <h2 className="text-gray-100 text-2xl mb-4">Chat Messages</h2>
                        <div className="text-gray-400">Select a chat to view messages.</div>
                    </div>
                )}
            </div>
        </div>
    );
}