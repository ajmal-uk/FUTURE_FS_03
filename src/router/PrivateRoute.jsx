// Private Route - Protects routes that require authentication
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading, isBanned } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="page-loader">
                <Loader size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (isBanned) {
        return <Navigate to="/auth" state={{ banned: true }} replace />;
    }

    return children;
};

export default PrivateRoute;
