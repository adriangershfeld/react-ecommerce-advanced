// src/components/AdminRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { UserData } from '../utils/userTypes';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, userData, loading } = useAuthContext();

  // Show loading while checking authentication
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Redirect to login if not authenticated or not an admin
  // This assumes you have an isAdmin field in your userData
  // If you don't have this field yet, you'll need to add it to your user data structure
  if (!user || !userData || !userData.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render children if user is an admin
  return <>{children}</>;
};

export default AdminRoute;