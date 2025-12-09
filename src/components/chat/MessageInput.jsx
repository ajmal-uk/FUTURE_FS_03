// Message Input Component
import { useState, useRef, useEffect } from "react";
import { sendMessage, setTypingStatus } from "../../firebase/rtdbService";
import { uploadChatImage, uploadAudio, uploadFile } from "../../services/cloudinaryService";
import { Loader } from "../common";
import { IconImage, IconPaperclip, IconMic, IconSend, IconStop } from "../common/Icons";
import "./MessageInput.css";

const MessageInput = ({ chatId, senderId, senderUsername }) => {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const typingTimeoutRef = useRef(null);

    // Clear error after 3 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Handle typing status
    useEffect(() => {
        if (text.length > 0) {
            setTypingStatus(chatId, senderId, true);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set timeout to clear typing status
            typingTimeoutRef.current = setTimeout(() => {
                setTypingStatus(chatId, senderId, false);
            }, 2000);
        }

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [text, chatId, senderId]);

    const handleSendText = async (e) => {
        e.preventDefault();
        if (!text.trim() || sending) return;

        setSending(true);
        try {
            await sendMessage(chatId, {
                senderId,
                senderUsername,
                type: "text",
                text: text.trim(),
            });
            setText("");
            setTypingStatus(chatId, senderId, false);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSending(true);
        try {
            const mediaUrl = await uploadChatImage(file);
            await sendMessage(chatId, {
                senderId,
                senderUsername,
                type: "image",
                mediaUrl,
            });
        } catch (err) {
            console.error("Error uploading image:", err);
            setError("Failed to upload image. Please configure Cloudinary upload presets.");
        } finally {
            setSending(false);
            e.target.value = "";
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSending(true);
        try {
            const mediaUrl = await uploadFile(file);
            await sendMessage(chatId, {
                senderId,
                senderUsername,
                type: "file",
                mediaUrl,
                fileName: file.name,
            });
        } catch (err) {
            console.error("Error uploading file:", err);
            setError("Failed to upload file. Please configure Cloudinary upload presets.");
        } finally {
            setSending(false);
            e.target.value = "";
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const file = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });

                setSending(true);
                try {
                    const mediaUrl = await uploadAudio(file);
                    await sendMessage(chatId, {
                        senderId,
                        senderUsername,
                        type: "audio",
                        mediaUrl,
                    });
                } catch (err) {
                    console.error("Error uploading audio:", err);
                    setError("Failed to upload voice message. Please configure Cloudinary presets.");
                } finally {
                    setSending(false);
                }

                // Stop tracks
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Update recording time
            const interval = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

            mediaRecorderRef.current.interval = interval;
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            clearInterval(mediaRecorderRef.current.interval);
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);
        }
    };

    const formatRecordingTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="message-input-container">
            {/* Error Toast */}
            {error && (
                <div className="message-input-error">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {isRecording ? (
                <div className="recording-ui">
                    <span className="recording-indicator">🔴</span>
                    <span className="recording-time">{formatRecordingTime(recordingTime)}</span>
                    <button
                        className="btn btn-danger btn-icon"
                        onClick={stopRecording}
                        title="Stop recording"
                    >
                        <IconStop size={20} />
                    </button>
                </div>
            ) : (
                <form className="message-input-form" onSubmit={handleSendText}>
                    {/* Attachment buttons */}
                    <div className="message-input-actions">
                        <input
                            type="file"
                            accept="image/*"
                            ref={imageInputRef}
                            onChange={handleImageUpload}
                            hidden
                        />
                        <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={sending}
                            title="Send image"
                        >
                            <IconImage size={20} />
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            hidden
                        />
                        <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={sending}
                            title="Send file"
                        >
                            <IconPaperclip size={20} />
                        </button>

                        <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            onClick={startRecording}
                            disabled={sending}
                            title="Record voice message"
                        >
                            <IconMic size={20} />
                        </button>
                    </div>

                    {/* Text input */}
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message..."
                        className="message-input"
                        disabled={sending}
                    />

                    {/* Send button */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-icon message-send"
                        disabled={!text.trim() || sending}
                    >
                        {sending ? <Loader size="sm" /> : <IconSend size={20} />}
                    </button>
                </form>
            )}
        </div>
    );
};

export default MessageInput;
