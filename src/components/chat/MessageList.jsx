// Message List Component - WhatsApp-style messages with status indicators
import { forwardRef, useState, useRef } from "react";
import { IconFile, IconImage, IconClock, IconCheckSingle, IconCheckDouble, IconPlay, IconPause, IconMic } from "../common/Icons";
import "./MessageList.css";

const MessageList = forwardRef(({ messages, currentUserId }, ref) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [playingAudio, setPlayingAudio] = useState(null);
    const audioRefs = useRef({});

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

    // Handle audio play/pause
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [audioCurrentTime, setAudioCurrentTime] = useState(0);

    // Handle audio play/pause
    const handleAudioToggle = (messageId) => {
        const audio = audioRefs.current[messageId];
        if (!audio) return;

        if (playingAudio === messageId) {
            audio.pause();
            setPlayingAudio(null);
        } else {
            // Pause any currently playing audio
            if (playingAudio && audioRefs.current[playingAudio]) {
                audioRefs.current[playingAudio].pause();
                audioRefs.current[playingAudio].currentTime = 0; // Optional: reset others
            }
            audio.play();
            setPlayingAudio(messageId);
        }
    };

    const handleTimeUpdate = (e) => {
        const audio = e.target;
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            setAudioProgress(progress);
            setAudioCurrentTime(audio.currentTime);
        }
    };

    const handleLoadedMetadata = (e) => {
        const audio = e.target;
        setAudioDuration(audio.duration);
    };

    const handleSeek = (e, messageId) => {
        const audio = audioRefs.current[messageId];
        if (!audio) return;

        const newTime = (e.target.value / 100) * audio.duration;
        audio.currentTime = newTime;
        setAudioProgress(e.target.value);
        setAudioCurrentTime(newTime);
    };

    // Handle audio ended
    const handleAudioEnded = (messageId) => {
        setPlayingAudio(null);
        setAudioProgress(0);
        setAudioCurrentTime(0);
    };

    // Format duration helper
    const formatDuration = (time) => {
        if (!time) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Render message status indicator (WhatsApp style)
    const renderMessageStatus = (message, isSent) => {
        if (!isSent) return null;

        const status = message.status || "sent";

        switch (status) {
            case "sending":
                return <IconClock size={14} />;
            case "sent":
                return <IconCheckSingle size={14} />;
            case "delivered":
                return <IconCheckDouble size={14} />;
            case "read":
                return <IconCheckDouble size={14} color="#53bdeb" />;
            default:
                return <IconCheckSingle size={14} />;
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

        const isPlaying = playingAudio === message.messageId;

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

                    {/* Audio Message - WhatsApp Style with Seekable Slider */}
                    {message.type === "audio" && (
                        <div className="message-audio-container">
                            <div className="audio-avatar">
                                <IconMic size={24} />
                            </div>
                            <div className="audio-content">
                                <button
                                    className="audio-play-btn"
                                    onClick={() => handleAudioToggle(message.messageId)}
                                >
                                    {isPlaying ? <IconPause size={20} /> : <IconPlay size={20} />}
                                </button>

                                <div className="audio-slider-container">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={isPlaying ? audioProgress : 0}
                                        onChange={(e) => handleSeek(e, message.messageId)}
                                        className="audio-slider"
                                        style={{
                                            backgroundSize: `${isPlaying ? audioProgress : 0}% 100%`
                                        }}
                                    />
                                    <div className="audio-timer">
                                        {isPlaying
                                            ? formatDuration(audioCurrentTime)
                                            : formatDuration(audioDuration || 0)}
                                    </div>
                                </div>

                                <audio
                                    ref={el => audioRefs.current[message.messageId] = el}
                                    src={message.mediaUrl}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onEnded={() => handleAudioEnded(message.messageId)}
                                    style={{ display: 'none' }}
                                />
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

                    {/* Message footer with time and status */}
                    <div className="message-footer">
                        <span className="message-time">{formatTime(message.createdAt)}</span>
                        {isSent && (
                            <span className="message-status">
                                {renderMessageStatus(message, isSent)}
                            </span>
                        )}
                    </div>
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
