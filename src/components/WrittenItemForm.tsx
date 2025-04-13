import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { useAuth } from "../contexts/AuthContext";
import { createLetter } from "../services/letterService";
import { LetterData } from "./LetterCreationForm";

interface WrittenItemFormProps {
  onComplete?: (letterData: LetterData) => void;
  onSuccess?: () => void;
}

const WrittenItemForm: React.FC<WrittenItemFormProps> = ({
  onComplete = () => {},
  onSuccess = () => {},
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [letterData, setLetterData] = useState<LetterData>({
    message: "",
    style: "classic",
    recipientName: "",
    recipientAddress: "",
    deliverySpeed: "standard",
  });

  const handleInputChange = (field: keyof LetterData, value: string) => {
    setLetterData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      await createLetter(letterData);
      onComplete(letterData);
      onSuccess();
      // Reset form
      setLetterData({
        message: "",
        style: "classic",
        recipientName: "",
        recipientAddress: "",
        deliverySpeed: "standard",
      });
    } catch (error) {
      console.error("Error creating letter:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const letterStyles = [
    {
      id: "classic",
      name: "Classic Elegance",
      description: "Traditional serif font on cream paper",
    },
    {
      id: "modern",
      name: "Modern Romance",
      description: "Clean sans-serif on white paper",
    },
    {
      id: "vintage",
      name: "Vintage Love",
      description: "Handwritten style on aged paper",
    },
    {
      id: "poetic",
      name: "Poetic Soul",
      description: "Flowing script on textured paper",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4">
        <div className="flex items-center">
          <Heart className="h-5 w-5 text-pink-500 mr-2" />
          <h2 className="text-xl font-serif text-pink-800">
            Write a New Letter
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <Label htmlFor="message">Your Message</Label>
          <Textarea
            id="message"
            placeholder="Pour your heart out..."
            className="min-h-[150px] mt-2 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
            value={letterData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="style">Letter Style</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {letterStyles.map((style) => (
              <Card
                key={style.id}
                className={`cursor-pointer transition-all p-3 hover:shadow-md ${letterData.style === style.id ? "ring-2 ring-pink-500 shadow-md" : "border-gray-200"}`}
                onClick={() => handleInputChange("style", style.id)}
              >
                <div className="font-medium">{style.name}</div>
                <p className="text-gray-500 text-sm">{style.description}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recipientName">Recipient's Name</Label>
            <Input
              id="recipientName"
              placeholder="Jane Doe"
              className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
              value={letterData.recipientName}
              onChange={(e) =>
                handleInputChange("recipientName", e.target.value)
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="deliverySpeed">Delivery Speed</Label>
            <select
              id="deliverySpeed"
              className="w-full mt-1 rounded-md border-pink-200 focus:border-pink-400 focus:ring-pink-400"
              value={letterData.deliverySpeed}
              onChange={(e) =>
                handleInputChange("deliverySpeed", e.target.value)
              }
            >
              <option value="standard">Standard (5-7 days) - $9.99</option>
              <option value="express">Express (2-3 days) - $14.99</option>
              <option value="overnight">Overnight - $24.99</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="recipientAddress">Recipient's Address</Label>
          <Textarea
            id="recipientAddress"
            placeholder="123 Love Lane, Heartsville, HS 12345"
            className="mt-1 min-h-[80px] border-pink-200 focus:border-pink-400 focus:ring-pink-400"
            value={letterData.recipientAddress}
            onChange={(e) =>
              handleInputChange("recipientAddress", e.target.value)
            }
            required
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
          >
            {isSubmitting ? "Sending..." : "Send Letter"}{" "}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WrittenItemForm;
