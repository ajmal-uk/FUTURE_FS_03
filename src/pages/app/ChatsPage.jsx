// Chats Page - List of conversations
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { subscribeToChats } from "../../firebase/rtdbService";
import ChatList from "../../components/chat/ChatList";
import { Loader } from "../../components/common";
import "./Chats.css";

const ChatsPage = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = subscribeToChats(currentUser.uid, (chatList) => {
            setChats(chatList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleChatSelect = (chatId) => {
        navigate(`/app/chats/${chatId}`);
    };

    if (loading) {
        return (
            <div className="chats-loading">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="chats-page">
            <div className="chats-header">
                <h1 className="chats-title">Chats</h1>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate("/app/search")}
                >
                    + New Chat
                </button>
            </div>

            {chats.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">💬</div>
                    <h3 className="empty-state-title">No conversations yet</h3>
                    <p className="empty-state-text">
                        Start chatting by searching for users or creating a group.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/app/search")}
                    >
                        Find Users
                    </button>
                </div>
            ) : (
                <ChatList chats={chats} onSelect={handleChatSelect} />
            )}
        </div>
    );
};

export default ChatsPage;
