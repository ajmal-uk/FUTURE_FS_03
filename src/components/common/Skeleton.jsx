// Skeleton Component for loading states
import "./Skeleton.css";

const Skeleton = ({
    variant = "text",
    size = "md",
    width,
    height,
    count = 1,
    className = ""
}) => {
    const getClassName = () => {
        let classes = ["skeleton"];

        switch (variant) {
            case "text":
                classes.push("skeleton-text");
                if (size === "sm") classes.push("sm");
                if (size === "lg") classes.push("lg");
                break;
            case "avatar":
                classes.push("skeleton-avatar");
                classes.push(size);
                break;
            case "rect":
                classes.push("skeleton-rect");
                break;
            case "card":
                classes.push("skeleton-card");
                break;
            default:
                break;
        }

        if (className) classes.push(className);

        return classes.join(" ");
    };

    const style = {};
    if (width) style.width = typeof width === "number" ? `${width}px` : width;
    if (height) style.height = typeof height === "number" ? `${height}px` : height;

    if (count > 1) {
        return (
            <>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className={getClassName()} style={style} />
                ))}
            </>
        );
    }

    return <div className={getClassName()} style={style} />;
};

// Pre-built skeleton patterns
export const SkeletonUserCard = () => (
    <div className="skeleton-user-card">
        <Skeleton variant="avatar" size="lg" />
        <div className="skeleton-user-card-info">
            <Skeleton variant="text" size="lg" width="60%" />
            <Skeleton variant="text" size="sm" width="40%" />
            <Skeleton variant="text" size="sm" width="80%" />
        </div>
    </div>
);

export const SkeletonStatusItem = () => (
    <div className="skeleton-status-item">
        <Skeleton variant="avatar" size="lg" />
        <div className="skeleton-status-info">
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" size="sm" width={60} />
        </div>
    </div>
);

export default Skeleton;
