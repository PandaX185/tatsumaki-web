"use client";

import FAB from "@/components/fab";
import MessageInput from "@/components/message_input";
import Modal from "@/components/modal";
import { time } from "console";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function Chats() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [userdata, setUserData] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [chatMembers, setChatMembers] = useState([]);
    const [editingChat, setEditingChat] = useState(null);
    const [chatMembersData, setChatMembersData] = useState([]);
    const messagesEndRef = useRef(null);

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
                    setChatMessages(prevMessages => {
                        // Check if message already exists to prevent duplicates
                        const messageExists = prevMessages.some(msg => msg.id === message.id);
                        if (messageExists) {
                            return prevMessages;
                        }
                        return [...prevMessages, message];
                    });
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
    }, [token, unreadMessages]);

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
            setChatMessages(prevMessages => {
                // Check if message already exists to prevent duplicates
                const messageExists = prevMessages.some(msg => msg.id === json.id);
                if (messageExists) {
                    return prevMessages;
                }
                return [...prevMessages, json];
            });
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

    const handleDeleteChat = async (chatId) => {
        console.log("Chat: ", chatId);
        const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            console.error('Failed to delete chat:', res.statusText);
        }

        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        setChatMessages([]);
        setSelectedChat(null);
    };

    const handleEditChat = (chatId, updatedBody) => {
        fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedBody)
        }).then(res => res.json()).then(data => {
            console.log('Chat updated:', data);
            // Update local state with the updated chat
            setChats(prevChats =>
                prevChats.map(chat =>
                    chat.id === chatId ? { ...chat, ...data } : chat
                )
            );
            if (selectedChat && selectedChat.id === chatId) {
                setSelectedChat(prev => ({ ...prev, ...data }));
            }
        }).catch(error => {
            console.error('Error updating chat:', error);
        });
    };

    const fetchChatMembers = async (chatId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}/members`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const json = await res.json();
            setChatMembersData(json || []);
            return json;
        } catch (error) {
            console.error('Failed to fetch chat members:', error);
            setChatMembersData([]);
        }
    };

    // Auto-scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    return (
        <div className="w-full h-screen flex flex-col lg:flex-row">
            <div className="lg:hidden bg-area p-4 border-b border-gray-700">
                <h1 className="text-lg font-semibold">
                    Hello, {userdata?.fullname} ({userdata?.username})!
                </h1>
                {selectedChat && (
                    <div className="mt-2 text-sm text-gray-300">
                        Currently viewing: {selectedChat.chat_name}
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col lg:flex-row h-full lg:gap-4">
                <div className={`side-area ${selectedChat ? 'hidden lg:flex' : 'flex'} lg:w-1/3 w-full flex-col relative`}>
                    <div className="hidden lg:block">
                        <h1 className="text-lg font-semibold mb-4">
                            Hello, {userdata?.fullname} ({userdata?.username})!
                        </h1>
                    </div>

                    <div className="flex-1 overflow-y-auto w-full">
                        <ul className="space-y-2">
                            {
                                chats && chats.length > 0 ? chats.map(chat => {
                                    const isUnread = unreadMessages && unreadMessages.length > 0 && unreadMessages.map(unreadChat => unreadChat.chat_id).includes(chat.id) && (selectedChat === null || chat.id != selectedChat.id);
                                    return (
                                        <li
                                            key={chat.id}
                                            className="chat-name flex items-center justify-between gap-2 p-3 hover:border rounded-lg cursor-pointer"
                                            onClick={() => {
                                                setSelectedChat(chat);
                                                markChatAsRead(chat.id);
                                            }}
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="truncate text-sm lg:text-base">{chat.chat_name}</span>
                                                {isUnread && <span className="text-red-300 text-xs lg:text-sm flex-shrink-0">NEW</span>}
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    type="button"
                                                    className="!bg-transparent hover:!bg-secondary"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setEditingChat(chat);
                                                        setChatMembers([]);
                                                        fetchChatMembers(chat.id);
                                                        setShowEditModal(true);
                                                    }}
                                                    aria-label="Edit chat"
                                                >
                                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                                        <path d="M4 21v-3.5L17.06 4.94a1.5 1.5 0 0 1 2.12 2.12L6.12 19.62H4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="!bg-transparent hover:!bg-red-400"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        handleDeleteChat(chat.id);
                                                    }}
                                                    aria-label="Delete chat"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        </li>
                                    );
                                }) : <h2 className="text-gray-400">Your chats will appear here.</h2>
                            }
                        </ul>
                    </div>
                    <FAB onClick={() => setShowSearchModal(true)} />

                    {showSearchModal && (
                        <Modal
                            show={showSearchModal}
                            onClose={async () => {
                                setShowSearchModal(false);
                                setSearchResults([]);
                                setSelectedUsers([]);
                                fetchChats().then((chats) => {
                                    if (chats && chats.length > 0) {
                                        setSelectedChat(chats[0]);
                                        markChatAsRead(chats[0].id);
                                    }
                                });
                            }}
                            onSubmit={handleSearch}
                            results={searchResults}
                            onUserSelect={handleUserSelect}
                            selectedUsers={selectedUsers}
                            token={token}
                        />
                    )}

                    {showEditModal && editingChat && (
                        <Modal
                            show={showEditModal}
                            onClose={async () => {
                                setShowEditModal(false);
                                setEditingChat(null);
                                setChatMembersData([]);
                                setChatMembers([]);
                            }}
                            onSubmit={handleSearch}
                            results={searchResults}
                            onUserSelect={() => { }}
                            selectedUsers={chatMembers}
                            token={token}
                            isEditMode={true}
                            editingChat={editingChat}
                            currentMembers={chatMembersData}
                            onChatUpdate={(updatedData) => {
                                handleEditChat(editingChat.id, updatedData);
                                setShowEditModal(false);
                                setEditingChat(null);
                            }}
                        />
                    )}
                </div>
                {selectedChat ? (
                    <div className={`${selectedChat ? 'flex' : 'hidden lg:flex'} lg:w-2/3 w-full flex-col h-full`}>
                        <div className="flex items-center p-4 border-b border-gray-700 bg-area">
                            <button
                                className="lg:hidden mr-3 text-gray-400 hover:text-white"
                                onClick={() => setSelectedChat(null)}
                                aria-label="Back to chat list"
                            >
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                </svg>
                            </button>
                            <h1 className="text-lg lg:text-xl font-semibold">{selectedChat?.chat_name}</h1>
                        </div>

                        <div className="side-area flex-1 overflow-y-auto p-4">
                            {chatMessages.length > 0 ? (
                                <div className="space-y-3">
                                    {chatMessages.map((message, index) => (
                                        <div
                                            key={`message-${message.id || index}-${index}`}
                                            className={`flex ${message.sender_id == userdata?.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[80%] lg:max-w-[70%] rounded-lg p-3 ${message.sender_id == userdata?.id
                                                ? 'bg-main'
                                                : 'bg-secondary'
                                                }`}>
                                                <div className="flex flex-col">
                                                    <div className="text-xs opacity-75 mb-1">
                                                        {message.username}
                                                    </div>
                                                    <div className="text-sm lg:text-base break-words">
                                                        {message.content}
                                                    </div>
                                                    <div className="text-xs opacity-60 mt-1 text-right">
                                                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            ) : (
                                <div className="text-gray-400 text-center py-8">No messages yet. Start the conversation!</div>
                            )}
                        </div>

                        <div className="pb-4 px-4 bg-area">
                            <MessageInput onSendMessage={handleSendMessage} />
                        </div>
                    </div>
                ) : (
                    <div className="hidden lg:flex lg:w-2/3 w-full flex-col items-center justify-center p-6 text-center">
                        <div className="max-w-md">
                            <h2 className="text-gray-100 text-xl lg:text-2xl mb-4">Welcome to Chat</h2>
                            <div className="text-gray-400 text-sm lg:text-base">
                                Select a chat from the sidebar to start messaging, or create a new chat to get started.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}