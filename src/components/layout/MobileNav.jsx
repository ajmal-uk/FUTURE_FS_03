// Mobile Navigation Bar with SVG Icons
import { NavLink } from "react-router-dom";
import { IconMessageSquare, IconCircle, IconPhone, IconSearch, IconSettings } from "../common/Icons";
import "./MobileNav.css";

const MobileNav = () => {
    const navItems = [
        { path: "/app/chats", icon: <IconMessageSquare size={22} />, label: "Chats" },
        { path: "/app/status", icon: <IconCircle size={22} />, label: "Status" },
        { path: "/app/calls", icon: <IconPhone size={22} />, label: "Calls" },
        { path: "/app/search", icon: <IconSearch size={22} />, label: "Search" },
        { path: "/app/settings", icon: <IconSettings size={22} />, label: "Settings" },
    ];

    return (
        <nav className="mobile-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `mobile-nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <span className="mobile-nav-icon">{item.icon}</span>
                    <span className="mobile-nav-label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default MobileNav;
