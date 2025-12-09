// Chat List Component
import ChatListItem from "./ChatListItem";
import "./ChatList.css";

const ChatList = ({ chats, onSelect }) => {
    return (
        <div className="chat-list">
            {chats.map((chat) => (
                <ChatListItem
                    key={chat.chatId}
                    chat={chat}
                    onClick={() => onSelect(chat.chatId)}
                />
            ))}
        </div>
    );
};

export default ChatList;
