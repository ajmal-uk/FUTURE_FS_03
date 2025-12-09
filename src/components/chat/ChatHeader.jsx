// Chat Header Component with Encryption Indicator
import { useNavigate } from "react-router-dom";
import { useCall } from "../../context/CallContext";
import { Avatar } from "../common";
import { IconChevronLeft, IconPhone, IconVideo, IconLock } from "../common/Icons";
import "./ChatHeader.css";

const ChatHeader = ({ chat, otherUser, typingUsers, onBack }) => {
    const navigate = useNavigate();
    const { startCall } = useCall();

    // Get display info
    const getDisplayInfo = () => {
        if (chat.isGroup) {
            const memberCount = chat.members ? Object.keys(chat.members).length : 0;
            return {
                name: chat.groupName || "Group",
                avatar: chat.groupIconUrl,
                subtitle: `${memberCount} members`,
            };
        } else if (otherUser) {
            return {
                name: otherUser.displayName || otherUser.username,
                avatar: otherUser.avatarUrl,
                subtitle: otherUser.isOnline
                    ? "Online"
                    : otherUser.lastSeen
                        ? `Last seen ${formatLastSeen(otherUser.lastSeen)}`
                        : "Offline",
                isOnline: otherUser.isOnline,
            };
        }
        return { name: "Unknown", avatar: null, subtitle: "" };
    };

    const formatLastSeen = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return "yesterday";
        return date.toLocaleDateString();
    };

    const { name, avatar, subtitle, isOnline } = getDisplayInfo();

    // Get typing text
    const getTypingText = () => {
        if (typingUsers.length === 0) return null;
        if (typingUsers.length === 1) return "typing...";
        return `${typingUsers.length} people typing...`;
    };

    const typingText = getTypingText();

    const handleAudioCall = async () => {
        if (otherUser) {
            try {
                await startCall(otherUser.uid, "audio");
            } catch (error) {
                console.error("Failed to start call:", error);
            }
        }
    };

    const handleVideoCall = async () => {
        if (otherUser) {
            try {
                await startCall(otherUser.uid, "video");
            } catch (error) {
                console.error("Failed to start call:", error);
            }
        }
    };

    return (
        <header className="chat-header">
            <button className="btn btn-ghost btn-icon chat-back" onClick={onBack}>
                <IconChevronLeft size={24} />
            </button>

            <div className="chat-header-info" onClick={() => chat.isGroup && navigate(`/app/chats/${chat.chatId}/info`)}>
                <Avatar
                    src={avatar}
                    name={name}
                    size="md"
                    showStatus={!chat.isGroup}
                    isOnline={isOnline}
                />
                <div className="chat-header-text">
                    <h2 className="chat-header-name">{name}</h2>
                    <p className={`chat-header-status ${typingText ? "typing" : ""}`}>
                        {typingText || subtitle}
                    </p>
                </div>
            </div>

            {/* Encryption indicator */}
            <div className="encryption-badge" title="End-to-end encrypted">
                <IconLock size={14} />
            </div>

            <div className="chat-header-actions">
                {!chat.isGroup && (
                    <>
                        <button
                            className="btn btn-ghost btn-icon"
                            onClick={handleAudioCall}
                            title="Audio call"
                        >
                            <IconPhone size={20} />
                        </button>
                        <button
                            className="btn btn-ghost btn-icon"
                            onClick={handleVideoCall}
                            title="Video call"
                        >
                            <IconVideo size={20} />
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};

export default ChatHeader;
