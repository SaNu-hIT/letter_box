import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Eye, Trash2, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useAuth } from "../contexts/AuthContext";
import { getLetters, deleteLetter, Letter } from "../services/letterService";
import { format } from "date-fns";

const WrittenItemList: React.FC = () => {
  const { user } = useAuth();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchLetters = async () => {
      try {
        setLoading(true);
        const fetchedLetters = await getLetters();
        setLetters(fetchedLetters);
        setError(null);
      } catch (err) {
        console.error("Error fetching letters:", err);
        setError("Failed to load your letters. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLetters();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this letter?")) return;

    try {
      await deleteLetter(id);
      setLetters((prev) => prev.filter((letter) => letter.id !== id));
    } catch (err) {
      console.error("Error deleting letter:", err);
      setError("Failed to delete the letter. Please try again later.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-500";
      case "delivered":
        return "text-green-500";
      case "in_transit":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 w-full bg-gray-200 rounded mb-4"></div>
          <div className="h-32 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (letters.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
          <CardContent className="pt-6 pb-8 px-6">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No Letters Yet
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't sent any love letters yet. Write your first one to get
              started!
            </p>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
              Write a Letter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-serif text-pink-800 mb-6">
        Your Love Letters
      </h2>

      <div className="space-y-4">
        {letters.map((letter) => (
          <motion.div
            key={letter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-4">
                  <div
                    className={`p-4 flex items-center justify-center ${letter.style === "classic" ? "bg-amber-50" : letter.style === "modern" ? "bg-blue-50" : letter.style === "vintage" ? "bg-orange-50" : "bg-purple-50"}`}
                  >
                    <div className="text-center">
                      <Mail className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                      <p className="text-sm font-medium capitalize">
                        {letter.style} Style
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(letter.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 md:col-span-2">
                    <h3 className="font-medium mb-1">
                      To: {letter.recipientName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {letter.recipientAddress.split("\n")[0]}
                      {letter.recipientAddress.split("\n").length > 1 && "..."}
                    </p>
                    <p className="text-sm line-clamp-2">
                      {letter.message.substring(0, 100)}
                      {letter.message.length > 100 && "..."}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <Clock
                          className={`h-4 w-4 mr-1 ${getStatusColor(letter.status)}`}
                        />
                        <span
                          className={`text-sm font-medium capitalize ${getStatusColor(letter.status)}`}
                        >
                          {letter.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4 capitalize">
                        {letter.deliverySpeed} Delivery
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-gray-600"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(letter.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WrittenItemList;
