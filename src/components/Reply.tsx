import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { Loader2, Send, Heart, LogIn } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";

const Reply: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [originalLetter, setOriginalLetter] = useState<any>(null);
  const [isLoadingLetter, setIsLoadingLetter] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in, if not redirect to login
    if (!user) {
      navigate("/login", { state: { returnUrl: `/reply/${id}` } });
      return;
    }

    // Fetch the original letter to display recipient name
    const fetchLetter = async () => {
      if (!id) return;

      try {
        setIsLoadingLetter(true);
        const { data, error } = await supabase
          .from("letters")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching letter:", error);
          toast({
            title: "Error",
            description: "Could not find the original letter.",
            variant: "destructive",
          });
        } else if (data) {
          setOriginalLetter(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoadingLetter(false);
      }
    };

    fetchLetter();
  }, [id, toast, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to send a reply.",
        variant: "destructive",
      });
      navigate("/login", { state: { returnUrl: `/reply/${id}` } });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please write a reply before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Save the reply to the database
      const { error } = await supabase.from("letter_replies").insert([
        {
          letter_id: id,
          message: message,
          created_at: new Date().toISOString(),
          user_id: user.id,
          sender_name: user.user_metadata?.full_name || "Anonymous",
          is_read: false,
        },
      ]);

      if (error) {
        throw error;
      }

      setIsSent(true);
      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully!",
      });

      // After 3 seconds, redirect to MyLetters page to show the replies tab
      setTimeout(() => {
        navigate("/my-letters", { state: { activeTab: "replies" } });
      }, 3000);
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: "Failed to send your reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingLetter) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-pink-50 to-purple-50">
        <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
        <span className="ml-2 text-pink-700">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg border-pink-100">
          <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100">
            <CardTitle className="text-center text-pink-800 flex items-center justify-center">
              <Heart className="h-5 w-5 mr-2 text-pink-500" />
              Reply Anonymously
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!isSent ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">
                    Send an anonymous reply to{" "}
                    <span className="font-medium text-pink-700">
                      {originalLetter?.recipientName || "your admirer"}
                    </span>
                  </p>
                  <Textarea
                    placeholder="Write your reply here..."
                    className="min-h-[200px] border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  disabled={isLoading || !user}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Reply
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <Heart className="h-8 w-8 text-pink-500" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Reply Sent Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your reply has been delivered. Thank you for using our
                  service.
                </p>
                <p className="text-sm text-pink-600">
                  Redirecting to your letters page...
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 text-center text-xs text-gray-500 py-3">
            {!user && (
              <div className="w-full text-center mb-2">
                <Button
                  variant="outline"
                  className="text-pink-600 hover:text-pink-700"
                  onClick={() =>
                    navigate("/login", { state: { returnUrl: `/reply/${id}` } })
                  }
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Log in to send a reply
                </Button>
              </div>
            )}
            Your identity remains private. We never share your personal
            information with recipients.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Reply;
