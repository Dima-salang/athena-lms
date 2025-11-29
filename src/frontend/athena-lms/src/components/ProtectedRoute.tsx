import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const role = localStorage.getItem('role');

    if (!role) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard based on role
        if (role === 'ROLE_STUDENT') {
            return <Navigate to="/student-dashboard" replace />;
        } else if (role === 'ROLE_TEACHER') {
            return <Navigate to="/dashboard" replace />;
        } else if (role === 'ROLE_ADMIN') {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/login" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
