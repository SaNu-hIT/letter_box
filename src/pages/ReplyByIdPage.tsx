import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ReplyByIdForm from "@/components/ReplyByIdForm";

const ReplyByIdPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl my-8">
      <div className="mb-6 flex items-center">
        <Link to="/">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-serif text-pink-800">Reply to a Letter</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="max-w-md mx-auto">
          <p className="text-gray-600 mb-6 text-center">
            Have you received a letter with a QR code? Enter the letter ID below
            to send your reply.
          </p>
          <ReplyByIdForm />
        </div>
      </div>
    </div>
  );
};

export default ReplyByIdPage;
