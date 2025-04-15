import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import PaymentForm from "@/components/PaymentForm";
import { useAuth } from "@/contexts/AuthContext";
import { LetterData } from "@/components/LetterCreationForm";

const Payment: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const letterData = location.state?.letterData as LetterData;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!letterData) {
    return <Navigate to="/create" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <PaymentForm letterData={letterData} />
      </div>
    </div>
  );
};

export default Payment;
