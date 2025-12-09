// Avatar Component
import "./Avatar.css";

const Avatar = ({
    src,
    name,
    size = "md",
    isOnline,
    showStatus = false,
    className = "",
}) => {
    // Get initials from name
    const getInitials = (name) => {
        if (!name) return "?";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className={`avatar-wrapper avatar-${size} ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={name || "Avatar"}
                    className="avatar-image"
                    onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                    }}
                />
            ) : null}
            <div
                className="avatar-fallback"
                style={{ display: src ? "none" : "flex" }}
            >
                {getInitials(name)}
            </div>
            {showStatus && (
                <span className={`avatar-status ${isOnline ? "online" : "offline"}`} />
            )}
        </div>
    );
};

export default Avatar;
