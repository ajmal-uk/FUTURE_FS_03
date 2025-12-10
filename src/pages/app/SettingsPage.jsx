// Settings Page with Theme Selection, Storage & Security
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useData } from "../../context/DataContext";
import { useEncryption } from "../../context/EncryptionContext";
import { updateUserProfile } from "../../firebase/rtdbService";
import { uploadProfileImage } from "../../services/cloudinaryService";
import { Avatar, Loader } from "../../components/common";
import { IconShield, IconLogOut, IconLock, IconTrash, IconShieldCheck } from "../../components/common/Icons";
import "./Settings.css";

const SettingsPage = () => {
    const { userProfile, logout, isAdmin } = useAuth();
    const { theme, setTheme } = useTheme();
    const { appSettings, updateSetting, clearCache, getCacheSize } = useData();
    const { isInitialized: encryptionReady } = useEncryption();
    const navigate = useNavigate();

    const [clearing, setClearing] = useState(false);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: userProfile?.displayName || "",
        about: userProfile?.about || "",
        phone: userProfile?.phone || "",
    });

    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!userProfile) return;

        setSaving(true);
        try {
            await updateUserProfile(userProfile.uid, {
                displayName: formData.displayName.trim(),
                about: formData.about.trim(),
                phone: formData.phone.trim(),
            });
            setEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !userProfile) return;

        setUploading(true);
        try {
            const avatarUrl = await uploadProfileImage(file);
            await updateUserProfile(userProfile.uid, { avatarUrl });
        } catch (error) {
            console.error("Error uploading avatar:", error);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    if (!userProfile) {
        return (
            <div className="settings-loading">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="settings-page">
            <header className="settings-header">
                <h1 className="settings-title">Settings</h1>
            </header>

            <div className="settings-content">
                {/* Profile Section */}
                <section className="settings-section">
                    <h2 className="settings-section-title">Profile</h2>

                    <div className="profile-card glass-card">
                        {/* Avatar */}
                        <div className="profile-avatar-section">
                            <div className="profile-avatar-wrapper">
                                <Avatar
                                    src={userProfile.avatarUrl}
                                    name={userProfile.displayName}
                                    size="2xl"
                                />
                                {uploading && (
                                    <div className="avatar-uploading">
                                        <Loader size="sm" />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                hidden
                            />
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                Change Photo
                            </button>
                        </div>

                        {/* Info */}
                        <div className="profile-info">
                            <div className="profile-field">
                                <label className="profile-label">Username</label>
                                <p className="profile-value">@{userProfile.username}</p>
                            </div>

                            <div className="profile-field">
                                <label className="profile-label">Display Name</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        className="input"
                                    />
                                ) : (
                                    <p className="profile-value">{userProfile.displayName}</p>
                                )}
                            </div>

                            <div className="profile-field">
                                <label className="profile-label">About</label>
                                {editing ? (
                                    <textarea
                                        name="about"
                                        value={formData.about}
                                        onChange={handleChange}
                                        className="input"
                                        rows={3}
                                    />
                                ) : (
                                    <p className="profile-value">{userProfile.about || "No bio yet"}</p>
                                )}
                            </div>

                            <div className="profile-field">
                                <label className="profile-label">Phone</label>
                                {editing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input"
                                    />
                                ) : (
                                    <p className="profile-value">
                                        {userProfile.phone || "Not set"}
                                    </p>
                                )}
                            </div>

                            <div className="profile-field">
                                <label className="profile-label">Email</label>
                                <p className="profile-value">{userProfile.email}</p>
                            </div>

                            <div className="profile-actions">
                                {editing ? (
                                    <>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSave}
                                            disabled={saving}
                                        >
                                            {saving ? <Loader size="sm" /> : "Save Changes"}
                                        </button>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => {
                                                setEditing(false);
                                                setFormData({
                                                    displayName: userProfile.displayName,
                                                    about: userProfile.about,
                                                    phone: userProfile.phone,
                                                });
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setEditing(true)}
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Appearance Section */}
                <section className="settings-section">
                    <h2 className="settings-section-title">Appearance</h2>
                    <div className="theme-selector glass-card">
                        <p className="theme-label">Theme</p>
                        <div className="theme-options">
                            <button
                                className={`theme-option ${theme === "light" ? "active" : ""}`}
                                onClick={() => setTheme("light")}
                            >
                                <span className="theme-option-icon">☀️</span>
                                <span className="theme-option-label">Light</span>
                            </button>
                            <button
                                className={`theme-option ${theme === "dark" ? "active" : ""}`}
                                onClick={() => setTheme("dark")}
                            >
                                <span className="theme-option-icon">🌙</span>
                                <span className="theme-option-label">Dark</span>
                            </button>
                            <button
                                className={`theme-option ${theme === "system" ? "active" : ""}`}
                                onClick={() => setTheme("system")}
                            >
                                <span className="theme-option-icon">🖥️</span>
                                <span className="theme-option-label">System</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Storage & Data Section */}
                <section className="settings-section">
                    <h2 className="settings-section-title">Storage & Data</h2>
                    <div className="settings-card glass-card">
                        {/* Image Compression Toggle */}
                        <div className="settings-toggle-row">
                            <div className="settings-toggle-info">
                                <span className="settings-toggle-label">Compress Images</span>
                                <span className="settings-toggle-desc">
                                    Reduce image size before sending to save storage
                                </span>
                            </div>
                            <button
                                className={`toggle-switch ${appSettings.compressImages ? 'active' : ''}`}
                                onClick={() => updateSetting('compressImages', !appSettings.compressImages)}
                            >
                                <span className="toggle-slider" />
                            </button>
                        </div>

                        {/* Cache Info */}
                        <div className="settings-info-row">
                            <span className="settings-info-label">Cache Size</span>
                            <span className="settings-info-value">{getCacheSize()} MB</span>
                        </div>

                        {/* Clear Cache Button */}
                        <button
                            className="btn btn-secondary settings-action-btn"
                            onClick={() => {
                                setClearing(true);
                                clearCache();
                                setTimeout(() => setClearing(false), 500);
                            }}
                            disabled={clearing}
                        >
                            <IconTrash size={18} />
                            {clearing ? 'Clearing...' : 'Clear Cache'}
                        </button>
                    </div>
                </section>

                {/* Privacy & Security Section */}
                <section className="settings-section">
                    <h2 className="settings-section-title">Privacy & Security</h2>
                    <div className="settings-card glass-card">
                        {/* Encryption Status */}
                        <div className="encryption-status">
                            <div className="encryption-status-icon">
                                {encryptionReady ? (
                                    <IconShieldCheck size={32} />
                                ) : (
                                    <IconLock size={32} />
                                )}
                            </div>
                            <div className="encryption-status-info">
                                <h4 className="encryption-status-title">
                                    {encryptionReady ? 'End-to-End Encryption Active' : 'Setting Up Encryption...'}
                                </h4>
                                <p className="encryption-status-desc">
                                    Messages encrypted with AES-256-GCM + ECDH key exchange.
                                </p>
                            </div>
                        </div>

                        {/* Security Tips */}
                        <div className="security-tips">
                            <p><IconLock size={14} /> Private keys stored only on your device</p>
                            <p><IconShieldCheck size={14} /> End-to-end encryption for all messages</p>
                        </div>
                    </div>
                </section>

                {/* Admin Section */}
                {isAdmin && (
                    <section className="settings-section">
                        <h2 className="settings-section-title">Admin</h2>
                        <div className="settings-links">
                            <button
                                className="settings-link"
                                onClick={() => navigate("/admin")}
                            >
                                <span className="settings-link-icon">
                                    <IconShield size={20} />
                                </span>
                                <span className="settings-link-text">Admin Dashboard</span>
                                <span className="settings-link-arrow">→</span>
                            </button>
                        </div>
                    </section>
                )}

                {/* Help & Legal Section */}
                <section className="settings-section">
                    <h2 className="settings-section-title">Help & Legal</h2>
                    <div className="settings-links">
                        <button
                            className="settings-link"
                            onClick={() => navigate("/help")}
                        >
                            <span className="settings-link-icon">❓</span>
                            <span className="settings-link-text">Help & Support</span>
                            <span className="settings-link-arrow">→</span>
                        </button>
                        <button
                            className="settings-link"
                            onClick={() => navigate("/privacy")}
                        >
                            <span className="settings-link-icon">🔒</span>
                            <span className="settings-link-text">Privacy Policy</span>
                            <span className="settings-link-arrow">→</span>
                        </button>
                        <button
                            className="settings-link"
                            onClick={() => navigate("/terms")}
                        >
                            <span className="settings-link-icon">📄</span>
                            <span className="settings-link-text">Terms of Service</span>
                            <span className="settings-link-arrow">→</span>
                        </button>
                    </div>
                </section>

                {/* Account Section */}
                <section className="settings-section">
                    <h2 className="settings-section-title">Account</h2>
                    <div className="settings-links">
                        <button
                            className="settings-link danger"
                            onClick={handleLogout}
                        >
                            <span className="settings-link-icon">
                                <IconLogOut size={20} />
                            </span>
                            <span className="settings-link-text">Log Out</span>
                            <span className="settings-link-arrow">→</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsPage;
