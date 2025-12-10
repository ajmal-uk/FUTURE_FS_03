// Sidebar Component with SVG Icons
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../common";
import { IconMessageSquare, IconCircle, IconPhone, IconSearch, IconSettings, IconShield, IconLogOut } from "../common/Icons";
import "./Sidebar.css";

const Sidebar = () => {
    const { userProfile, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const navItems = [
        { path: "/app/chats", icon: <IconMessageSquare size={20} />, label: "Chats" },
        { path: "/app/status", icon: <IconCircle size={20} />, label: "Status" },
        { path: "/app/calls", icon: <IconPhone size={20} />, label: "Calls" },
        { path: "/app/search", icon: <IconSearch size={20} />, label: "Search" },

        { path: "/app/settings", icon: <IconSettings size={20} />, label: "Settings" },
    ];

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-header">
                <span className="sidebar-logo-icon">
                    <IconMessageSquare size={24} />
                </span>
                <span className="sidebar-logo-text">ZyChat</span>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        <span className="sidebar-nav-icon">{item.icon}</span>
                        <span className="sidebar-nav-label">{item.label}</span>
                    </NavLink>
                ))}

                {isAdmin && (
                    <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                            `sidebar-nav-item admin-link ${isActive ? "active" : ""}`
                        }
                    >
                        <span className="sidebar-nav-icon"><IconShield size={20} /></span>
                        <span className="sidebar-nav-label">Admin</span>
                    </NavLink>
                )}
            </nav>

            {/* User Profile */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <Avatar
                        src={userProfile?.avatarUrl}
                        name={userProfile?.displayName}
                        size="md"
                        showStatus
                        isOnline={true}
                    />
                    <div className="sidebar-user-info">
                        <p className="sidebar-user-name">{userProfile?.displayName}</p>
                        <p className="sidebar-user-username">@{userProfile?.username}</p>
                    </div>
                </div>
                <button
                    className="btn btn-ghost btn-icon sidebar-logout"
                    onClick={handleLogout}
                    title="Logout"
                >
                    <IconLogOut size={20} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
