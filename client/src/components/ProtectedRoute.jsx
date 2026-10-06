import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
    children,
    allowedRoles
}) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    const user = JSON.parse(storedUser);

    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return children;
};

export default ProtectedRoute;