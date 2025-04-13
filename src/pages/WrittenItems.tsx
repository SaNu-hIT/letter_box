import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WrittenItemForm from "@/components/WrittenItemForm";
import WrittenItemList from "@/components/WrittenItemList";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, PenSquare, List } from "lucide-react";

const WrittenItems: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("write");
  const [showSuccess, setShowSuccess] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 w-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
          <Heart className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-gray-800 mb-4">
            Sign In to Continue
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in or create an account to write and manage your love
            letters.
          </p>
          <div className="space-y-3">
            <Button
              className="w-full bg-rose-500 hover:bg-rose-600 text-white"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              className="w-full border-rose-300 text-rose-600 hover:bg-rose-50"
              onClick={() => navigate("/signup")}
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSuccess = () => {
    setShowSuccess(true);
    setActiveTab("list");
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-gray-800">
            Your Love Letters
          </h1>
          <Button
            variant="ghost"
            className="text-rose-500 hover:bg-rose-50"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </div>

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-center"
          >
            <div className="bg-green-100 rounded-full p-1 mr-3">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <p>Your letter has been sent successfully!</p>
          </motion.div>
        )}

        <Tabs
          defaultValue="write"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="write" className="flex items-center">
              <PenSquare className="h-4 w-4 mr-2" /> Write a Letter
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center">
              <List className="h-4 w-4 mr-2" /> My Letters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="mt-4">
            <WrittenItemForm onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <WrittenItemList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WrittenItems;
