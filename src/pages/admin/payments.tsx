import React from "react";
import AdminRoute from "../../components/AdminRoute";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminPaymentsPage: React.FC = () => {
  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-purple-800">Payments</h1>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Payment Management Coming Soon
              </h2>
              <p className="text-gray-600 text-center max-w-md">
                This feature is currently under development. You'll soon be able
                to track and manage all payments from this dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminPaymentsPage;
