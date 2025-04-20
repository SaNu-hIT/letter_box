import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/services/auth";

const ReplyByIdForm: React.FC = () => {
  const [letterId, setLetterId] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!letterId.trim()) {
      toast({
        title: "Missing Letter ID",
        description: "Please enter a letter ID to reply to.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);

    try {
      // Verify the letter exists before navigating
      const { data, error } = await supabase
        .from("letters")
        .select("id")
        .eq("id", letterId)
        .single();

      if (error || !data) {
        toast({
          title: "Letter Not Found",
          description:
            "We couldn't find a letter with that ID. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      // Letter exists, navigate to reply page
      navigate(`/reply/${letterId}`);
    } catch (error) {
      console.error("Error checking letter:", error);
      toast({
        title: "Error",
        description:
          "An error occurred while checking the letter ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="shadow-md border-pink-100 max-w-md mx-auto">
      <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100">
        <CardTitle className="text-center text-pink-800">
          Reply to a Letter
        </CardTitle>
        <CardDescription className="text-center text-pink-600">
          Enter the ID of the letter you received to send a reply
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="letterId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Letter ID
            </label>
            <Input
              id="letterId"
              value={letterId}
              onChange={(e) => setLetterId(e.target.value)}
              placeholder="Enter the letter ID"
              className="w-full border-pink-200 focus:border-pink-400 focus:ring-pink-400"
              disabled={isChecking}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Continue to Reply
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="bg-gray-50 text-center text-xs text-gray-500 py-3">
        The letter ID can be found on the physical letter you received
      </CardFooter>
    </Card>
  );
};

export default ReplyByIdForm;
