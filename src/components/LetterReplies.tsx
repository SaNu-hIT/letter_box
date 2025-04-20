import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, Heart, MessageCircle } from "lucide-react";
import { supabase } from "@/services/auth";

interface LetterRepliesProps {
  letterId?: string;
}

interface Reply {
  id: string;
  letter_id: string;
  message: string;
  created_at: string;
  sender_name: string;
  is_read: boolean;
}

const LetterReplies: React.FC<LetterRepliesProps> = ({ letterId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (letterId) {
      fetchReplies(letterId);
    } else if (user) {
      fetchAllUserReplies();
    } else {
      setIsLoading(false);
    }
  }, [letterId, user]);

  const fetchReplies = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("letter_replies")
        .select("*")
        .eq("letter_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReplies(data || []);

      // Mark replies as read
      if (data && data.length > 0) {
        const unreadReplies = data
          .filter((reply) => !reply.is_read)
          .map((reply) => reply.id);
        if (unreadReplies.length > 0) {
          await supabase
            .from("letter_replies")
            .update({ is_read: true })
            .in("id", unreadReplies);
        }
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
      toast({
        title: "Error",
        description: "Failed to load replies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUserReplies = async () => {
    try {
      setIsLoading(true);
      // First get all letters by the user
      const { data: userLetters, error: lettersError } = await supabase
        .from("letters")
        .select("id")
        .eq("user_id", user?.id);

      if (lettersError) throw lettersError;

      if (!userLetters || userLetters.length === 0) {
        setReplies([]);
        return;
      }

      // Get all replies for those letters
      const letterIds = userLetters.map((letter) => letter.id);
      const { data, error } = await supabase
        .from("letter_replies")
        .select("*")
        .in("letter_id", letterIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReplies(data || []);
    } catch (error) {
      console.error("Error fetching user replies:", error);
      toast({
        title: "Error",
        description: "Failed to load your replies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 text-pink-500 animate-spin" />
        <span className="ml-2 text-pink-700">Loading replies...</span>
      </div>
    );
  }

  if (replies.length === 0) {
    return (
      <div className="text-center py-8 bg-pink-50 rounded-lg">
        <MessageCircle className="h-12 w-12 text-pink-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-pink-800 mb-2">
          No Replies Yet
        </h3>
        <p className="text-gray-600">
          {letterId
            ? "This letter hasn't received any replies yet."
            : "You haven't received any replies to your letters yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-serif text-pink-800 mb-4">
        {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
      </h3>

      {replies.map((reply) => (
        <Card
          key={reply.id}
          className="overflow-hidden hover:shadow-md transition-shadow duration-300"
        >
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-serif text-pink-800">
                From: {reply.sender_name || "Anonymous"}
              </CardTitle>
              <Badge className="bg-pink-100 text-pink-800">
                {reply.is_read ? "Read" : "New"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-gray-700 mb-4 italic whitespace-pre-line">
              "{reply.message}"
            </p>
            <p className="text-xs text-gray-500">
              Received: {formatDate(reply.created_at)}
            </p>
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-between pt-3 pb-3">
            <div className="flex items-center text-pink-600">
              <Heart className="h-4 w-4 mr-1" />
              <span className="text-sm">Anonymous reply</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default LetterReplies;
