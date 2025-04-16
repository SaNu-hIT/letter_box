import React from "react";
import AdminRoute from "../../components/AdminRoute";
import LettersReport from "../../components/admin/LettersReport";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminLettersPage: React.FC = () => {
  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <LettersReport />
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminLettersPage;
