// AI Chat Page - ZyBot Assistant
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    isAIConfigured,
    saveAPIKey,
    removeAPIKey,
    getAISettings,
    saveAISettings,
    getAIHistory,
    clearAIHistory,
    sendMessageToAI,
    validateAPIKey,
    getReminders,
    deleteReminder,
} from "../../services/aiService";
import { Avatar, Loader } from "../../components/common";
import { IconSend, IconSettings, IconTrash, IconX, IconCheck } from "../../components/common/Icons";
import "./AIChat.css";

const AIChatPage = () => {
    const { userProfile } = useAuth();
    const [isConfigured, setIsConfigured] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState(getAISettings());
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [sending, setSending] = useState(false);
    const [reminders, setReminders] = useState([]);
    const messagesEndRef = useRef(null);

    // Check if configured on mount
    useEffect(() => {
        setIsConfigured(isAIConfigured());
        if (isAIConfigured()) {
            setMessages(getAIHistory());
            setReminders(getReminders());
        }
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle API key setup
    const handleSetupAPI = async () => {
        if (!apiKey.trim()) {
            setError("Please enter your API key");
            return;
        }

        setValidating(true);
        setError("");

        try {
            const isValid = await validateAPIKey(apiKey.trim());
            if (isValid) {
                saveAPIKey(apiKey.trim());
                setIsConfigured(true);
                setApiKey("");
                // Add welcome message
                setMessages([{
                    role: "assistant",
                    text: `Hello ${userProfile?.displayName || 'there'}! 👋 I'm ZyBot, your AI assistant in ZyChat.\n\nI can help you with:\n• Setting reminders\n• Scheduling messages\n• Answering questions\n• And much more!\n\nHow can I help you today?`,
                    timestamp: Date.now(),
                }]);
            } else {
                setError("Invalid API key. Please check and try again.");
            }
        } catch (err) {
            setError("Failed to validate API key. Please try again.");
        } finally {
            setValidating(false);
        }
    };

    // Handle sending message
    const handleSendMessage = async () => {
        if (!inputValue.trim() || sending) return;

        const userMessage = inputValue.trim();
        setInputValue("");
        setSending(true);

        // Add user message immediately
        const newMessages = [
            ...messages,
            { role: "user", text: userMessage, timestamp: Date.now() }
        ];
        setMessages(newMessages);

        try {
            const response = await sendMessageToAI(userMessage, userProfile);
            setMessages(prevMessages => [
                ...prevMessages,
                { role: "assistant", text: response.text, timestamp: Date.now() }
            ]);

            // Update reminders if action was taken
            if (response.action?.action === "reminder") {
                setReminders(getReminders());
            }
        } catch (err) {
            setMessages(prevMessages => [
                ...prevMessages,
                {
                    role: "assistant",
                    text: `Sorry, I encountered an error: ${err.message}`,
                    timestamp: Date.now(),
                    isError: true
                }
            ]);
        } finally {
            setSending(false);
        }
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Handle settings change
    const handleSettingsChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        saveAISettings(newSettings);
    };

    // Handle clear history
    const handleClearHistory = () => {
        if (confirm("Are you sure you want to clear all chat history with ZyBot?")) {
            clearAIHistory();
            setMessages([]);
        }
    };

    // Handle remove API key
    const handleRemoveAPIKey = () => {
        if (confirm("Are you sure you want to remove your API key? You'll need to set it up again to use ZyBot.")) {
            removeAPIKey();
            clearAIHistory();
            setIsConfigured(false);
            setMessages([]);
            setShowSettings(false);
        }
    };

    // Handle delete reminder
    const handleDeleteReminder = (id) => {
        const updated = deleteReminder(id);
        setReminders(updated);
    };

    // Format time
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    // Render welcome screen (API not configured)
    if (!isConfigured) {
        return (
            <div className="ai-chat-page">
                <div className="ai-welcome">
                    <div className="ai-welcome-icon">
                        <div className="ai-avatar-large">🤖</div>
                    </div>
                    <h1 className="ai-welcome-title">Meet ZyBot</h1>
                    <p className="ai-welcome-subtitle">
                        Your AI assistant powered by Google Gemini
                    </p>

                    <div className="ai-welcome-features">
                        <div className="ai-feature">
                            <span className="ai-feature-icon">💬</span>
                            <span>Chat naturally</span>
                        </div>
                        <div className="ai-feature">
                            <span className="ai-feature-icon">⏰</span>
                            <span>Set reminders</span>
                        </div>
                        <div className="ai-feature">
                            <span className="ai-feature-icon">📅</span>
                            <span>Schedule messages</span>
                        </div>
                        <div className="ai-feature">
                            <span className="ai-feature-icon">🔒</span>
                            <span>Private & secure</span>
                        </div>
                    </div>

                    <div className="ai-setup-card glass-card">
                        <h3>Setup Your API Key</h3>
                        <p className="ai-setup-info">
                            To use ZyBot, you need a Google AI Studio API key.
                            Your key is stored locally on your device only.
                        </p>

                        <a
                            href="https://aistudio.google.com/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ai-api-link"
                        >
                            🔗 Get your free API key from Google AI Studio
                        </a>

                        <div className="ai-setup-form">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Paste your API key here..."
                                className="input ai-api-input"
                            />
                            <button
                                className="btn btn-primary"
                                onClick={handleSetupAPI}
                                disabled={validating || !apiKey.trim()}
                            >
                                {validating ? <Loader size="sm" /> : "Continue"}
                            </button>
                        </div>

                        {error && <p className="ai-setup-error">{error}</p>}

                        <p className="ai-privacy-note">
                            🔒 Your API key is stored only on your device and never sent to our servers.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Render chat interface
    return (
        <div className="ai-chat-page">
            {/* Header */}
            <header className="ai-chat-header">
                <div className="ai-chat-header-info">
                    <div className="ai-avatar">🤖</div>
                    <div className="ai-chat-header-text">
                        <h2>ZyBot</h2>
                        <p>AI Assistant • Powered by Gemini</p>
                    </div>
                </div>
                <div className="ai-chat-header-actions">
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setShowSettings(!showSettings)}
                        title="Settings"
                    >
                        <IconSettings size={20} />
                    </button>
                </div>
            </header>

            {/* Settings Panel */}
            {showSettings && (
                <div className="ai-settings-panel glass-card">
                    <div className="ai-settings-header">
                        <h3>ZyBot Settings</h3>
                        <button className="btn btn-ghost btn-icon" onClick={() => setShowSettings(false)}>
                            <IconX size={20} />
                        </button>
                    </div>

                    <div className="ai-settings-content">
                        <div className="ai-setting-item">
                            <div className="ai-setting-info">
                                <span className="ai-setting-label">Allow chat access</span>
                                <span className="ai-setting-desc">Let ZyBot read your chats for context</span>
                            </div>
                            <button
                                className={`ai-toggle ${settings.canAccessChats ? "active" : ""}`}
                                onClick={() => handleSettingsChange("canAccessChats", !settings.canAccessChats)}
                            >
                                <span className="ai-toggle-slider" />
                            </button>
                        </div>

                        <div className="ai-setting-item">
                            <div className="ai-setting-info">
                                <span className="ai-setting-label">Enable reminders</span>
                                <span className="ai-setting-desc">Allow ZyBot to set reminders</span>
                            </div>
                            <button
                                className={`ai-toggle ${settings.canSetReminders ? "active" : ""}`}
                                onClick={() => handleSettingsChange("canSetReminders", !settings.canSetReminders)}
                            >
                                <span className="ai-toggle-slider" />
                            </button>
                        </div>

                        <div className="ai-settings-actions">
                            <button className="btn btn-ghost" onClick={handleClearHistory}>
                                <IconTrash size={16} /> Clear History
                            </button>
                            <button className="btn btn-danger" onClick={handleRemoveAPIKey}>
                                Remove API Key
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="ai-messages">
                {messages.length === 0 ? (
                    <div className="ai-empty-state">
                        <div className="ai-avatar-large">🤖</div>
                        <p>Start a conversation with ZyBot!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`ai-message ${msg.role === "user" ? "user" : "assistant"} ${msg.isError ? "error" : ""}`}
                        >
                            {msg.role === "assistant" && (
                                <div className="ai-message-avatar">🤖</div>
                            )}
                            <div className="ai-message-bubble">
                                <p className="ai-message-text">{msg.text}</p>
                                <span className="ai-message-time">{formatTime(msg.timestamp)}</span>
                            </div>
                        </div>
                    ))
                )}
                {sending && (
                    <div className="ai-message assistant">
                        <div className="ai-message-avatar">🤖</div>
                        <div className="ai-message-bubble loading">
                            <div className="ai-typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Reminders (if any) */}
            {reminders.length > 0 && (
                <div className="ai-reminders">
                    <h4>📌 Reminders</h4>
                    {reminders.map((reminder) => (
                        <div key={reminder.id} className="ai-reminder">
                            <span className="ai-reminder-text">{reminder.text}</span>
                            {reminder.time && <span className="ai-reminder-time">{reminder.time}</span>}
                            <button
                                className="btn btn-ghost btn-icon btn-sm"
                                onClick={() => handleDeleteReminder(reminder.id)}
                            >
                                <IconX size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="ai-input-container">
                <div className="ai-input-wrapper">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask ZyBot anything..."
                        className="ai-input"
                        rows={1}
                        disabled={sending}
                    />
                    <button
                        className="btn btn-primary btn-icon ai-send-btn"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || sending}
                    >
                        <IconSend size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChatPage;
