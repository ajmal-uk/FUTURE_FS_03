// Message List Component - WhatsApp-style messages
import { forwardRef, useState } from "react";
import { IconFile, IconImage } from "../common/Icons";
import "./MessageList.css";

const MessageList = forwardRef(({ messages, currentUserId }, ref) => {
    const [selectedImage, setSelectedImage] = useState(null);

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
            });
        }
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = formatDate(message.createdAt);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    const renderMessage = (message) => {
        const isSent = message.senderId === currentUserId;
        const isSystem = message.senderId === "system";

        if (isSystem) {
            return (
                <div key={message.messageId} className="message-system">
                    <p>{message.text}</p>
                </div>
            );
        }

        return (
            <div
                key={message.messageId}
                className={`message ${isSent ? "sent" : "received"}`}
            >
                <div className={`message-bubble ${message.type !== "text" ? "media" : ""}`}>
                    {!isSent && (
                        <span className="message-sender">@{message.senderUsername}</span>
                    )}

                    {/* Text Message */}
                    {message.type === "text" && (
                        <p className="message-text">{message.text}</p>
                    )}

                    {/* Image Message - WhatsApp Style */}
                    {message.type === "image" && (
                        <div className="message-image-container" onClick={() => setSelectedImage(message.mediaUrl)}>
                            <img
                                src={message.mediaUrl}
                                alt="Shared image"
                                className="message-image"
                                loading="lazy"
                            />
                            <div className="message-image-overlay">
                                <IconImage size={24} />
                            </div>
                        </div>
                    )}

                    {/* Audio Message - WhatsApp Style with waveform */}
                    {message.type === "audio" && (
                        <div className="message-audio-container">
                            <div className="audio-avatar">
                                <div className="audio-icon">🎤</div>
                            </div>
                            <div className="audio-content">
                                <audio
                                    controls
                                    src={message.mediaUrl}
                                    className="message-audio"
                                    preload="metadata"
                                >
                                    Your browser does not support audio.
                                </audio>
                                <div className="audio-waveform">
                                    {[...Array(20)].map((_, i) => (
                                        <span
                                            key={i}
                                            className="waveform-bar"
                                            style={{ height: `${Math.random() * 100}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* File Message - WhatsApp Style */}
                    {message.type === "file" && (
                        <a
                            href={message.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="message-file"
                            download
                        >
                            <div className="file-icon-wrapper">
                                <IconFile size={28} />
                            </div>
                            <div className="file-info">
                                <span className="file-name">
                                    {message.fileName || "Download file"}
                                </span>
                                <span className="file-type">
                                    {message.fileName?.split('.').pop()?.toUpperCase() || "FILE"}
                                </span>
                            </div>
                            <div className="file-download">⬇</div>
                        </a>
                    )}

                    <span className="message-time">{formatTime(message.createdAt)}</span>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="message-list">
                {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date} className="message-group">
                        <div className="message-date-divider">
                            <span>{date}</span>
                        </div>
                        {msgs.map(renderMessage)}
                    </div>
                ))}
                <div ref={ref} />
            </div>

            {/* Image Lightbox */}
            {selectedImage && (
                <div className="image-lightbox" onClick={() => setSelectedImage(null)}>
                    <button className="lightbox-close" onClick={() => setSelectedImage(null)}>✕</button>
                    <img src={selectedImage} alt="Full size" />
                </div>
            )}
        </>
    );
});

MessageList.displayName = "MessageList";

export default MessageList;
