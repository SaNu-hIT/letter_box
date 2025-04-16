import React from "react";
import AdminRoute from "../../components/AdminRoute";
import Dashboard from "../../components/admin/Dashboard";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminDashboard: React.FC = () => {
  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <Dashboard />
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminDashboard;
