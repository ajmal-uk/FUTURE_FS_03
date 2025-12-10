// Chats Page - List of conversations (using cached data)
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import ChatList from "../../components/chat/ChatList";
import { Loader } from "../../components/common";
import "./Chats.css";

const ChatsPage = () => {
    const { chats, chatsLoading } = useData();
    const navigate = useNavigate();

    const handleChatSelect = (chatId) => {
        navigate(`/app/chats/${chatId}`);
    };

    if (chatsLoading) {
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
