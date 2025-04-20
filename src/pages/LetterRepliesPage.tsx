import React from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LetterReplies from "@/components/LetterReplies";

const LetterRepliesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto p-6 max-w-4xl my-8">
      <div className="mb-6 flex items-center">
        <Link to="/my-letters">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Letters
          </Button>
        </Link>
        <h1 className="text-3xl font-serif text-pink-800">Letter Replies</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <LetterReplies letterId={id} />
      </div>
    </div>
  );
};

export default LetterRepliesPage;
