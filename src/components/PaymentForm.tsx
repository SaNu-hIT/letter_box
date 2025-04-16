import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Lock, Calendar, CheckCircle } from "lucide-react";
import { LetterData } from "./LetterCreationForm";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/services/stripe";
import {
  getPricingOptions,
  fallbackPricingOptions,
  PricingOption,
} from "@/services/pricing";

interface PaymentFormProps {
  letterData: LetterData;
  onSuccess?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  letterData,
  onSuccess = () => {},
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>(
    fallbackPricingOptions,
  );
  const [selectedPricingOption, setSelectedPricingOption] =
    useState<PricingOption | null>(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // Load pricing options from Supabase
  useEffect(() => {
    const fetchPricingOptions = async () => {
      try {
        setIsLoadingPricing(true);
        const options = await getPricingOptions();
        if (options && options.length > 0) {
          setPricingOptions(options);

          // Find the pricing option that matches the letter's delivery speed
          const matchingOption = options.find(
            (option) =>
              option.delivery_speed === letterData.deliverySpeed ||
              option.id === letterData.pricingOptionId,
          );

          if (matchingOption) {
            setSelectedPricingOption(matchingOption);
          } else {
            // Default to the first option if no match is found
            setSelectedPricingOption(options[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching pricing options:", error);
        // Use fallback pricing options
        const matchingOption = fallbackPricingOptions.find(
          (option) =>
            option.delivery_speed === letterData.deliverySpeed ||
            option.id === letterData.pricingOptionId,
        );

        if (matchingOption) {
          setSelectedPricingOption(matchingOption);
        } else {
          setSelectedPricingOption(fallbackPricingOptions[0]);
        }
      } finally {
        setIsLoadingPricing(false);
      }
    };

    fetchPricingOptions();
  }, [letterData.deliverySpeed, letterData.pricingOptionId]);

  const handleInputChange = (field: string, value: string) => {
    setPaymentData({ ...paymentData, [field]: value });
  };

  // Get price based on selected pricing option
  const getPrice = () => {
    return selectedPricingOption?.price || 799; // Default to 799 if no option is selected
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // This would be replaced with actual payment processing
      // For now, we'll simulate a successful payment after a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const finalLetter = {
        ...letterData,
        status: "pending",
        createdAt: new Date().toISOString(),
        isDraft: false,
        userId: user?.id, // Make sure user ID is included
        pricingOptionId:
          selectedPricingOption?.id || letterData.pricingOptionId || "standard",
        price: getPrice(),
      };

      // First try to save to Supabase
      try {
        // Import the module directly to avoid dynamic import issues
        const lettersService = await import("@/services/letters");
        console.log("About to save letter with user ID:", user?.id);
        if (!finalLetter.userId) {
          console.error("No user ID in finalLetter, adding it now");
          finalLetter.userId = user?.id;
        }
        console.log("Final letter data being sent to saveLetter:", finalLetter);
        const savedLetter = await lettersService.saveLetter(finalLetter);
        console.log("Letter saved successfully:", savedLetter);
      } catch (err) {
        console.error(
          "Failed to save to Supabase, falling back to localStorage",
          err,
        );
        // Fallback to localStorage if Supabase fails
        const sentLetters = JSON.parse(
          localStorage.getItem("sentLetters") || "[]",
        );
        sentLetters.push({
          ...finalLetter,
          id: `letter-${Date.now()}`,
        });
        localStorage.setItem("sentLetters", JSON.stringify(sentLetters));
      }

      // Show success toast
      toast({
        title: "Payment Successful",
        description:
          "Your letter has been processed and will be delivered soon.",
      });

      // Navigate to confirmation page
      navigate("/confirmation", { state: { letterData: finalLetter } });
      onSuccess();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description:
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100">
            <CardTitle className="text-2xl font-serif text-pink-800">
              Complete Your Order
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Payment Details</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="cardNumber"
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4 text-pink-500" />
                      Card Number
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) =>
                        handleInputChange("cardNumber", e.target.value)
                      }
                      required
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="cardName"
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4 text-pink-500" />
                      Name on Card
                    </Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={paymentData.cardName}
                      onChange={(e) =>
                        handleInputChange("cardName", e.target.value)
                      }
                      required
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="expiryDate"
                        className="flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4 text-pink-500" />
                        Expiry Date
                      </Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) =>
                          handleInputChange("expiryDate", e.target.value)
                        }
                        required
                        className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-pink-500" />
                        CVV
                      </Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) =>
                          handleInputChange("cvv", e.target.value)
                        }
                        required
                        className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                    >
                      {isProcessing ? (
                        "Processing..."
                      ) : (
                        <>Pay ₹{getPrice().toLocaleString("en-IN")}</>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-center text-gray-500 mt-2">
                    Your payment information is secure and encrypted
                  </p>
                </form>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Letter Style:</span>
                      <span className="font-medium capitalize">
                        {letterData.style}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium capitalize">
                        {selectedPricingOption
                          ? `${
                              selectedPricingOption.delivery_speed ===
                              "standard"
                                ? "Standard"
                                : selectedPricingOption.delivery_speed ===
                                    "express"
                                  ? "Express"
                                  : "Priority"
                            } (${selectedPricingOption.delivery_days})`
                          : letterData.deliverySpeed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recipient:</span>
                      <span className="font-medium">
                        {letterData.recipientName}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 my-3 pt-3">
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span className="text-pink-700">
                          ₹{getPrice().toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      Your letter will be printed on premium paper with your
                      selected design.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      Includes a unique QR code for anonymous replies.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      Discreet packaging with no sender information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50 border-t border-gray-100 p-4 text-center text-sm text-gray-500">
            By completing this purchase, you agree to our Terms of Service and
            Privacy Policy.
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentForm;
