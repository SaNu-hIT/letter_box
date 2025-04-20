import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LetterCreationForm, { LetterData } from "./LetterCreationForm";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { supabase } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { getPricingOptions, fallbackPricingOptions } from "@/services/pricing";

const ReplyLetterForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [originalLetter, setOriginalLetter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pricingOptions, setPricingOptions] = useState(fallbackPricingOptions);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);

  useEffect(() => {
    const fetchOriginalLetter = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("letters")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setOriginalLetter(data);
        } else {
          setError("Letter not found");
        }
      } catch (error: any) {
        console.error("Error fetching letter:", error);
        setError(error.message || "Failed to load the letter");
        toast({
          title: "Error",
          description: "Failed to load the letter. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOriginalLetter();

    // Load pricing options
    const loadPricingOptions = async () => {
      try {
        setIsLoadingPricing(true);
        const options = await getPricingOptions();
        if (options && options.length > 0) {
          setPricingOptions(options);
        }
      } catch (error) {
        console.error("Error fetching pricing options:", error);
        // Fallback pricing options are already set as default
      } finally {
        setIsLoadingPricing(false);
      }
    };

    loadPricingOptions();
  }, [id, toast]);

  const handleReplyComplete = async (replyData: any) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to send a reply.",
          variant: "destructive",
        });
        navigate("/login", { state: { returnUrl: `/reply/${id}` } });
        return;
      }

      if (!id) {
        toast({
          title: "Error",
          description: "Missing letter ID.",
          variant: "destructive",
        });
        return;
      }

      // If we have pricing information, proceed to payment
      if (replyData.pricingOptionId) {
        // Navigate to payment page with the letter data
        navigate("/payment", {
          state: {
            letterData: {
              ...replyData,
              isReply: true,
              originalLetterId: id,
            },
          },
        });
        return;
      }

      // If no pricing info (fallback), create the reply record directly
      const { data, error } = await supabase.from("replies").insert([
        {
          letter_id: id,
          message: replyData.message,
          user_id: user.id,
          style: replyData.style,
          price: replyData.price || 799, // Default price if not specified
          pricingOptionId: replyData.pricingOptionId || "standard",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent successfully.",
      });

      // Redirect to the user's letters page or home
      navigate("/my-letters");
    } catch (error: any) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: "Failed to send your reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading letter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-medium text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Initial data for the letter creation form when used as a reply
  const initialReplyData: LetterData = {
    message: "",
    style: "classic",
    recipientName: originalLetter?.sender_name || "Anonymous",
    recipientAddress: `Reply to Letter #${id}`, // Show the letter ID instead of an address
    deliverySpeed: "standard",
    isDraft: false,
    originalLetterId: id,
    // Set default pricing option
    pricingOptionId:
      pricingOptions.length > 0
        ? pricingOptions[0].id
        : "00000000-0000-0000-0000-000000000001",
    price: pricingOptions.length > 0 ? pricingOptions[0].price : 799,
    // Include minimal required fields
    senderAddress: {
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "India",
      saveAddress: false,
    },
    recipientAddressDetails: {
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "India",
    },
  };

  // Check if user is logged in before rendering the form
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-pink-50 to-purple-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-serif text-pink-800 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to reply to this letter.
          </p>
          <div className="flex flex-col space-y-4">
            <Button
              onClick={() =>
                navigate("/login", { state: { returnUrl: `/reply/${id}` } })
              }
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              Log In
            </Button>
            <Button
              onClick={() =>
                navigate("/signup", { state: { returnUrl: `/reply/${id}` } })
              }
              variant="outline"
              className="border-pink-300 text-pink-700 hover:bg-pink-50"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 py-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-pink-300 text-pink-700 hover:bg-pink-50"
          >
            <span className="mr-2">←</span> Back to Home
          </Button>
          <h1 className="text-3xl font-serif text-center text-pink-800">
            Reply to Letter #{id}
          </h1>
          <div className="w-[140px]"></div> {/* Spacer for balance */}
        </div>
        <LetterCreationForm
          onComplete={handleReplyComplete}
          initialData={initialReplyData}
          isReplyMode={true}
          pricingOptions={pricingOptions}
          isLoadingPricing={isLoadingPricing}
        />
      </div>
    </div>
  );
};

export default ReplyLetterForm;
