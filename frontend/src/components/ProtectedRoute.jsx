import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// wraps pages that need a logged-in user
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();                 // user + loading from context

    // wait while AuthContext checks the cookie
    if (loading) {
        return <p className="loading">Checking login...</p>;
    }

    // not logged in - redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // logged in - show the page
    return children;
}

export default ProtectedRoute;