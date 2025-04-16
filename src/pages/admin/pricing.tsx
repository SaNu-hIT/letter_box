import React from "react";
import AdminRoute from "../../components/AdminRoute";
import PricingOptions from "../../components/admin/PricingOptions";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminPricing: React.FC = () => {
  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <PricingOptions />
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminPricing;
