import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../store/useAdminAuthStore';

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated } = useAdminAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login page with the return url
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
