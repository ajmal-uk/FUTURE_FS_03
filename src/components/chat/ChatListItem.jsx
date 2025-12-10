// Chat List Item Component
import { useState, useEffect } from "react";
import { ref, query, orderByChild, limitToLast, onValue } from "firebase/database";
import { rtdb } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { getUser } from "../../firebase/rtdbService";
import { Avatar } from "../common";
import "./ChatListItem.css";

const ChatListItem = ({ chat, onClick }) => {
    const { currentUser } = useAuth();
    const [otherUser, setOtherUser] = useState(chat.otherUser || null);
    const [lastMessage, setLastMessage] = useState(chat.lastMessage || null);

    // Fetch other user if not available
    useEffect(() => {
        const fetchOtherUser = async () => {
            if (!chat.isGroup && !otherUser && chat.members && currentUser) {
                const memberIds = Object.keys(chat.members);
                const otherUid = memberIds.find(id => id !== currentUser.uid);
                if (otherUid) {
                    try {
                        const user = await getUser(otherUid);
                        if (user) {
                            setOtherUser(user);
                        }
                    } catch (err) {
                        console.error("Error fetching other user:", err);
                    }
                }
            }
        };

        if (chat.otherUser) {
            setOtherUser(chat.otherUser);
        } else {
            fetchOtherUser();
        }
    }, [chat, currentUser, otherUser]);

    // Subscribe to last message updates
    useEffect(() => {
        // Always update from chat prop if available
        if (chat.lastMessage) {
            setLastMessage(chat.lastMessage);
        }
    }, [chat.lastMessage]);

    // Subscribe to real-time last message updates
    useEffect(() => {
        if (!chat.chatId) return;

        const messagesRef = query(
            ref(rtdb, `messages/${chat.chatId}`),
            orderByChild("createdAt"),
            limitToLast(1)
        );

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    setLastMessage(child.val());
                });
            } else {
                setLastMessage(null); // No messages yet
            }
        }, (error) => {
            console.error("Error subscribing to last message:", error);
        });

        return () => unsubscribe();
    }, [chat.chatId]);

    // Format time
    const formatTime = (timestamp) => {
        if (!timestamp) return "";

        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } else if (days === 1) {
            return "Yesterday";
        } else if (days < 7) {
            return date.toLocaleDateString([], { weekday: "short" });
        } else {
            return date.toLocaleDateString([], { month: "short", day: "numeric" });
        }
    };

    // Get display info
    const getDisplayInfo = () => {
        if (chat.isGroup) {
            return {
                name: chat.groupName || "Group",
                avatar: chat.groupIconUrl,
                isOnline: false,
            };
        } else if (otherUser) {
            return {
                name: otherUser.displayName || otherUser.username || "User",
                avatar: otherUser.avatarUrl,
                isOnline: otherUser.isOnline,
            };
        }
        return { name: "Loading...", avatar: null, isOnline: false };
    };

    const { name, avatar, isOnline } = getDisplayInfo();

    // Get last message preview
    const getMessagePreview = () => {
        if (!lastMessage) return "No messages yet";

        const msg = lastMessage;
        switch (msg.type) {
            case "image":
                return "📷 Photo";
            case "audio":
                return "🎤 Voice message";
            case "file":
                return `📎 ${msg.fileName || "File"}`;
            default:
                return msg.text || "";
        }
    };

    return (
        <div className="chat-list-item" onClick={onClick}>
            <Avatar
                src={avatar}
                name={name}
                size="lg"
                showStatus={!chat.isGroup}
                isOnline={isOnline}
            />
            <div className="chat-list-item-content">
                <div className="chat-list-item-header">
                    <h4 className="chat-list-item-name">{name}</h4>
                    <span className="chat-list-item-time">
                        {formatTime(lastMessage?.createdAt)}
                    </span>
                </div>
                <p className="chat-list-item-preview">{getMessagePreview()}</p>
            </div>
        </div>
    );
};

export default ChatListItem;

