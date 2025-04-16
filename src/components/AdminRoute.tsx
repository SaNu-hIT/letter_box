import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type AdminRouteProps = {
  children: React.ReactNode;
};

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Check both user auth and admin status from session storage as a fallback
  const isAdminSession =
    sessionStorage.getItem("adminSession") === "true" ||
    localStorage.getItem("isAdmin") === "true";

  if ((!user && !isAdminSession) || (!isAdmin && !isAdminSession)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
