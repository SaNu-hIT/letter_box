import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Send,
  Eye,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import LetterPreview from "./LetterPreview";

interface LetterCreationFormProps {
  onComplete?: (letterData: LetterData) => void;
}

export interface LetterData {
  message: string;
  style: string;
  recipientName: string;
  recipientAddress: string;
  deliverySpeed: string;
}

const LetterCreationForm: React.FC<LetterCreationFormProps> = ({
  onComplete = () => {},
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [letterData, setLetterData] = useState<LetterData>({
    message: "",
    style: "classic",
    recipientName: "",
    recipientAddress: "",
    deliverySpeed: "standard",
  });

  const steps = [
    { title: "Write Message", icon: <Heart className="h-5 w-5" /> },
    { title: "Select Style", icon: <Sparkles className="h-5 w-5" /> },
    { title: "Recipient Details", icon: <Send className="h-5 w-5" /> },
    { title: "Delivery Options", icon: <ChevronRight className="h-5 w-5" /> },
    { title: "Preview", icon: <Eye className="h-5 w-5" /> },
  ];

  const handleInputChange = (field: keyof LetterData, value: string) => {
    setLetterData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(letterData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Progress Steps */}
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${index <= currentStep ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-500"} transition-colors duration-300`}
              >
                {step.icon}
              </div>
              <span
                className={`text-xs mt-2 ${index <= currentStep ? "text-pink-700" : "text-gray-500"}`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 h-1 bg-gray-200 rounded-full">
          <div
            className="h-full bg-pink-500 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 md:p-8 bg-white">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px] flex flex-col justify-between"
        >
          {/* Step 1: Write Message */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif text-pink-800">
                  Pour Your Heart Out
                </h2>
                <p className="text-gray-600 mt-2">
                  Write your anonymous love letter below. Express your feelings
                  freely.
                </p>
              </div>

              <Textarea
                placeholder="Dear..."
                className="min-h-[250px] border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                value={letterData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
              />

              <p className="text-sm text-gray-500 italic">
                Your message will remain anonymous. We never share your
                identity.
              </p>
            </div>
          )}

          {/* Step 2: Select Style */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif text-pink-800">
                  Choose Your Letter Style
                </h2>
                <p className="text-gray-600 mt-2">
                  Select a style that best expresses your feelings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {letterStyles.map((style) => (
                  <Card
                    key={style.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${letterData.style === style.id ? "ring-2 ring-pink-500 shadow-md" : "border-gray-200"}`}
                    onClick={() => handleInputChange("style", style.id)}
                  >
                    <CardContent className="p-4">
                      <div className="font-medium text-lg">{style.name}</div>
                      <p className="text-gray-500 text-sm mt-1">
                        {style.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Recipient Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif text-pink-800">
                  Recipient Details
                </h2>
                <p className="text-gray-600 mt-2">
                  Enter the details of your letter's recipient.
                </p>
              </div>

              <div className="space-y-4">
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
                  />
                </div>

                <div>
                  <Label htmlFor="recipientAddress">Recipient's Address</Label>
                  <Textarea
                    id="recipientAddress"
                    placeholder="123 Love Lane, Heartsville, HS 12345"
                    className="mt-1 min-h-[120px] border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    value={letterData.recipientAddress}
                    onChange={(e) =>
                      handleInputChange("recipientAddress", e.target.value)
                    }
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500 italic">
                We handle all deliveries with care and discretion.
              </p>
            </div>
          )}

          {/* Step 4: Delivery Options */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif text-pink-800">
                  Delivery Options
                </h2>
                <p className="text-gray-600 mt-2">
                  Choose how quickly you want your letter to be delivered.
                </p>
              </div>

              <RadioGroup
                value={letterData.deliverySpeed}
                onValueChange={(value) =>
                  handleInputChange("deliverySpeed", value)
                }
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-pink-50 transition-colors cursor-pointer">
                  <RadioGroupItem
                    value="standard"
                    id="standard"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="standard"
                      className="text-lg font-medium cursor-pointer"
                    >
                      Standard Delivery
                    </Label>
                    <p className="text-gray-600 mt-1">
                      Your letter will be delivered within 5-7 business days.
                    </p>
                    <p className="text-pink-700 font-medium mt-2">$9.99</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-pink-50 transition-colors cursor-pointer">
                  <RadioGroupItem
                    value="express"
                    id="express"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="express"
                      className="text-lg font-medium cursor-pointer"
                    >
                      Express Delivery
                    </Label>
                    <p className="text-gray-600 mt-1">
                      Your letter will be delivered within 2-3 business days.
                    </p>
                    <p className="text-pink-700 font-medium mt-2">$14.99</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-pink-50 transition-colors cursor-pointer">
                  <RadioGroupItem
                    value="overnight"
                    id="overnight"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="overnight"
                      className="text-lg font-medium cursor-pointer"
                    >
                      Overnight Delivery
                    </Label>
                    <p className="text-gray-600 mt-1">
                      Your letter will be delivered the next business day.
                    </p>
                    <p className="text-pink-700 font-medium mt-2">$24.99</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 5: Preview */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif text-pink-800">
                  Preview Your Letter
                </h2>
                <p className="text-gray-600 mt-2">
                  Review your letter before finalizing.
                </p>
              </div>

              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="details">Order Details</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <div className="flex justify-center">
                    <LetterPreview
                      message={letterData.message}
                      style={letterData.style}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="details" className="mt-4">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-700">Recipient</h3>
                        <p className="mt-1">{letterData.recipientName}</p>
                        <p className="mt-1 whitespace-pre-line">
                          {letterData.recipientAddress}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-700">
                          Letter Style
                        </h3>
                        <p className="mt-1">
                          {
                            letterStyles.find((s) => s.id === letterData.style)
                              ?.name
                          }
                        </p>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-700">
                          Delivery Option
                        </h3>
                        <p className="mt-1 capitalize">
                          {letterData.deliverySpeed} Delivery
                        </p>
                        <p className="text-pink-700 font-medium mt-1">
                          {letterData.deliverySpeed === "standard"
                            ? "$9.99"
                            : letterData.deliverySpeed === "express"
                              ? "$14.99"
                              : "$24.99"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <p className="text-sm text-gray-500 italic">
                A unique QR code will be included with your letter for the
                recipient to reply anonymously.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="border-pink-300 text-pink-700 hover:bg-pink-50"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Proceed to Payment <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LetterCreationForm;
