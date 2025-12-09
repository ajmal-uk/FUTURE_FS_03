// User Search Page
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserByUsername, createOrGetChat } from "../../firebase/rtdbService";
import { Avatar, Loader } from "../../components/common";
import "./UserSearch.css";

const UserSearchPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [searching, setSearching] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [creating, setCreating] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        setSearchResult(null);
        setNotFound(false);

        try {
            const username = searchQuery.toLowerCase().trim().replace("@", "");
            const user = await getUserByUsername(username);

            if (user) {
                if (user.uid === currentUser.uid) {
                    setNotFound(true);
                } else if (user.isBanned) {
                    setNotFound(true);
                } else {
                    setSearchResult(user);
                }
            } else {
                setNotFound(true);
            }
        } catch (error) {
            console.error("Search error:", error);
            setNotFound(true);
        } finally {
            setSearching(false);
        }
    };

    const handleOpenChat = async (userId) => {
        if (!currentUser) return;

        setCreating(true);
        try {
            const chatId = await createOrGetChat(currentUser.uid, userId);
            navigate(`/app/chats/${chatId}`);
        } catch (error) {
            console.error("Error creating chat:", error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="search-page">
            <header className="search-header">
                <h1 className="search-title">Search Users</h1>
            </header>

            <div className="search-content">
                {/* Search Form */}
                <form className="search-form" onSubmit={handleSearch}>
                    <div className="search-input-wrapper">
                        <span className="search-prefix">@</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="username"
                            className="search-input"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!searchQuery.trim() || searching}
                    >
                        {searching ? <Loader size="sm" /> : "Search"}
                    </button>
                </form>

                {/* Results */}
                <div className="search-results">
                    {searching && (
                        <div className="search-loading">
                            <Loader />
                            <p>Searching...</p>
                        </div>
                    )}

                    {notFound && !searching && (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <h3 className="empty-state-title">User not found</h3>
                            <p className="empty-state-text">
                                No user with that username exists. Check the spelling and try again.
                            </p>
                        </div>
                    )}

                    {searchResult && (
                        <div className="user-result glass-card">
                            <Avatar
                                src={searchResult.avatarUrl}
                                name={searchResult.displayName}
                                size="xl"
                                showStatus
                                isOnline={searchResult.isOnline}
                            />
                            <div className="user-result-info">
                                <h3 className="user-result-name">{searchResult.displayName}</h3>
                                <p className="user-result-username">@{searchResult.username}</p>
                                {searchResult.about && (
                                    <p className="user-result-about">{searchResult.about}</p>
                                )}
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleOpenChat(searchResult.uid)}
                                disabled={creating}
                            >
                                {creating ? <Loader size="sm" /> : "Open Chat"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Help Text */}
                <div className="search-help">
                    <p>Search for users by their unique username to start a conversation.</p>
                </div>
            </div>
        </div>
    );
};

export default UserSearchPage;
