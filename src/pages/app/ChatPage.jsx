// Chat Page - Active chat view
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    getChat,
    subscribeToMessages,
    subscribeToTypingStatus,
    getUser,
} from "../../firebase/rtdbService";
import ChatHeader from "../../components/chat/ChatHeader";
import MessageList from "../../components/chat/MessageList";
import MessageInput from "../../components/chat/MessageInput";
import { Loader } from "../../components/common";
import "./Chat.css";

const ChatPage = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();

    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);

    // Load chat data
    useEffect(() => {
        if (!chatId || !currentUser) return;

        const loadChat = async () => {
            const chatData = await getChat(chatId);

            if (!chatData) {
                navigate("/app/chats");
                return;
            }

            setChat(chatData);

            // For 1-on-1 chats, get other user info
            if (!chatData.isGroup) {
                const memberIds = Object.keys(chatData.members);
                const otherUid = memberIds.find((id) => id !== currentUser.uid);
                if (otherUid) {
                    const userData = await getUser(otherUid);
                    setOtherUser(userData);
                }
            }

            setLoading(false);
        };

        loadChat();
    }, [chatId, currentUser, navigate]);

    // Subscribe to messages
    useEffect(() => {
        if (!chatId) return;

        const unsubscribe = subscribeToMessages(chatId, (messageList) => {
            setMessages(messageList);
        });

        return () => unsubscribe();
    }, [chatId]);

    // Subscribe to typing status
    useEffect(() => {
        if (!chatId || !currentUser) return;

        const unsubscribe = subscribeToTypingStatus(chatId, currentUser.uid, (users) => {
            setTypingUsers(users);
        });

        return () => unsubscribe();
    }, [chatId, currentUser]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (loading) {
        return (
            <div className="chat-loading">
                <Loader size="lg" />
            </div>
        );
    }

    if (!chat) {
        return null;
    }

    return (
        <div className="chat-page">
            <ChatHeader
                chat={chat}
                otherUser={otherUser}
                typingUsers={typingUsers}
                onBack={() => navigate("/app/chats")}
            />

            <MessageList
                messages={messages}
                currentUserId={currentUser.uid}
                ref={messagesEndRef}
            />

            <MessageInput
                chatId={chatId}
                senderId={currentUser.uid}
                senderUsername={userProfile.username}
            />
        </div>
    );
};

export default ChatPage;
