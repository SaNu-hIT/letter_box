import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Send,
  Eye,
  Sparkles,
  Save,
  Wand2,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
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
  draftId?: string;
}

export interface LetterData {
  id?: string;
  message: string;
  style: string;
  recipientName: string;
  recipientAddress: string;
  deliverySpeed: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  isDraft?: boolean;
}

const LetterCreationForm: React.FC<LetterCreationFormProps> = ({
  onComplete = () => {},
  draftId,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [letterData, setLetterData] = useState<LetterData>({
    message: "",
    style: "classic",
    recipientName: "",
    recipientAddress: "",
    deliverySpeed: "standard",
    isDraft: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(draftId ? true : false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedMood, setSelectedMood] = useState("romantic");

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

  // Load draft if draftId is provided
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryDraftId = params.get("draftId");
    const locationState = window.history.state?.usr?.draftId;

    const draftToLoad = draftId || queryDraftId || locationState;

    if (draftToLoad) {
      console.log("Loading draft with ID:", draftToLoad);
      loadDraft(draftToLoad);
    }
  }, [draftId]);

  const loadDraft = async (id: string) => {
    try {
      setIsLoading(true);
      console.log("Loading draft with ID:", id);

      // First try to load from Supabase
      if (user) {
        try {
          console.log("Attempting to load from Supabase...");
          const { getUserLetters } = await import("@/services/letters");
          const userLetters = await getUserLetters(user.id);
          const supabaseDraft = userLetters.find((letter) => letter.id === id);

          if (supabaseDraft) {
            console.log("Draft found in Supabase:", supabaseDraft);
            setLetterData(supabaseDraft);
            toast({
              title: "Draft loaded",
              description:
                "Your draft has been loaded successfully from database.",
            });
            return;
          }
        } catch (supabaseError) {
          console.error("Error loading draft from Supabase:", supabaseError);
          // Fall back to localStorage if Supabase fails
        }
      }

      // If not found in Supabase or there was an error, try localStorage
      console.log("Attempting to load from localStorage...");
      const savedDrafts = JSON.parse(
        localStorage.getItem("letterDrafts") || "[]",
      );
      const localDraft = savedDrafts.find((d: LetterData) => d.id === id);

      if (localDraft) {
        console.log("Draft found in localStorage:", localDraft);
        setLetterData(localDraft);
        toast({
          title: "Draft loaded",
          description:
            "Your draft has been loaded successfully from local storage.",
        });
        return;
      }

      // If we get here, the draft wasn't found
      console.warn("Draft not found in Supabase or localStorage");
      toast({
        title: "Draft not found",
        description: "We couldn't find the draft you're looking for.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error loading draft:", error);
      toast({
        title: "Error",
        description: "Failed to load your draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save drafts.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const draftToSave = {
        ...letterData,
        id: letterData.id || `draft-${Date.now()}`,
        userId: user.id,
        updatedAt: new Date().toISOString(),
        createdAt: letterData.createdAt || new Date().toISOString(),
        isDraft: true,
      };

      // Try to save to Supabase first
      try {
        const { saveLetter, updateLetter } = await import("@/services/letters");

        if (!draftToSave.id || draftToSave.id.startsWith("draft-")) {
          // For new drafts or localStorage drafts
          const savedLetter = await saveLetter(draftToSave);
          setLetterData(savedLetter);
        } else {
          // For existing Supabase drafts
          const updatedLetter = await updateLetter(draftToSave.id, draftToSave);
          setLetterData(updatedLetter);
        }
      } catch (supabaseError) {
        console.error(
          "Error saving to Supabase, falling back to localStorage",
          supabaseError,
        );

        // Fallback to localStorage
        const savedDrafts = JSON.parse(
          localStorage.getItem("letterDrafts") || "[]",
        );
        const existingDraftIndex = savedDrafts.findIndex(
          (d: LetterData) => d.id === draftToSave.id,
        );

        if (existingDraftIndex >= 0) {
          savedDrafts[existingDraftIndex] = draftToSave;
        } else {
          savedDrafts.push(draftToSave);
        }

        localStorage.setItem("letterDrafts", JSON.stringify(savedDrafts));
        setLetterData(draftToSave);
      }

      toast({
        title: "Draft saved",
        description: "Your letter has been saved as a draft.",
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save your draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - if this is a draft, update it to not be a draft anymore
      if (letterData.id && letterData.isDraft) {
        try {
          setIsSaving(true);
          const { updateLetter } = await import("@/services/letters");
          const updatedLetterData = {
            ...letterData,
            isDraft: false,
            status: "pending",
          };

          const updatedLetter = await updateLetter(
            letterData.id,
            updatedLetterData,
          );
          // Navigate to payment page with the updated letter data
          navigate("/payment", { state: { letterData: updatedLetter } });
        } catch (error) {
          console.error("Error updating draft status:", error);
          toast({
            title: "Error",
            description: "Failed to update your letter. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsSaving(false);
        }
      } else {
        // If it's not a draft, just navigate to payment
        navigate("/payment", { state: { letterData } });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateAILetter = async () => {
    setIsGeneratingAI(true);
    try {
      // Simulate API call to AI service
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Sample AI-generated letters based on mood
      const aiLetters = {
        romantic:
          "Dear beloved,\n\nAs I write these words, my heart beats with a rhythm that only you can inspire. Every moment we've shared has been etched into my soul, creating a tapestry of memories that I cherish deeply.\n\nYour smile is the light that guides me through my darkest days, and your laughter is the melody that brings joy to my world. When our eyes meet, time seems to stand still, and I find myself lost in the depth of your gaze.\n\nI've never been good at expressing my feelings, but I want you to know that you mean everything to me. You are the first thought in my morning and the last whisper in my dreams.\n\nForever yours,",
        passionate:
          "My dearest,\n\nThe fire you've ignited in my heart burns with an intensity that consumes my every thought. I find myself breathless at the mere thought of you, captivated by the passion that flows between us like an electric current.\n\nYour touch sends shivers down my spine, awakening desires I never knew existed. The way you move, the sound of your voice, the scent of your skin – everything about you drives me wild with longing.\n\nI crave your presence like the desert craves rain, desperate and unrelenting. When we're apart, I count the seconds until we're together again, until I can lose myself in your embrace once more.\n\nDesperately yours,",
        poetic:
          "To the keeper of my heart,\n\nIn the garden of life, you are the rarest bloom,\nA flower whose beauty outshines the midnight moon.\nYour essence, like nectar, sweet and divine,\nIntoxicates my senses, makes stars align.\n\nLike verses of poetry written in the sky,\nOur love story unfolds as days pass by.\nYour soul, a sonnet of infinite grace,\nHolds me captive in its warm embrace.\n\nThrough seasons changing and tides that turn,\nMy devotion to you will eternally burn.\nFor you are my muse, my lyrical dream,\nThe inspiration behind every word I glean.\n\nEternally inspired by you,",
        playful:
          "Hey you! Yes, YOU! \n\nGuess what? I've been trying to solve this really complicated math problem lately. It goes something like: U + Me = Happiness. And I think I've finally cracked the solution!\n\nYou know what's funny? I've been making a list of the best things in my life, and somehow your name keeps appearing at the top. Coincidence? I think not!\n\nI'm not saying you're perfect or anything... but if there was an Olympic event for being amazing, you'd definitely win the gold medal. And I'd be cheering the loudest from the stands!\n\nSo here's a virtual high-five, a silly dance, and a whole lot of heart emojis coming your way. Because life's too short not to tell someone they make your heart do the cha-cha slide!\n\nWith a grin and a wink,",
        nostalgic:
          "My cherished one,\n\nDo you remember that autumn day when the leaves danced around us like confetti? I close my eyes and I'm there again, feeling the warmth of your hand in mine despite the chill in the air.\n\nTime has a way of flowing like a river, carrying us forward, yet the memories we've created remain like stones in that stream – permanent, unchanging, beautiful in their constancy.\n\nI find myself revisiting the chapters of our story – the coffee shop where we first talked until closing time, the park bench where we shared secrets under starlight, the rainy afternoon when we danced in puddles like children.\n\nThese memories are my most treasured possessions, worn smooth by frequent remembering, glowing with the patina that only time and love can create.\n\nYours, through all our seasons,",
        heartfelt:
          "My dearest,\n\nSome feelings are too profound for ordinary words, too vast to be contained in simple sentences. Yet I find myself trying, because what I feel for you deserves to be expressed, even if imperfectly.\n\nYou've touched my life in ways I never thought possible. You've seen me at my worst and loved me anyway. You've celebrated my best and made those moments even brighter. Your kindness, your strength, your beautiful spirit – they've become essential parts of my world.\n\nI want you to know that you are valued beyond measure, loved beyond reason, and appreciated beyond words. The space you occupy in my heart grows larger with each passing day.\n\nThank you for being exactly who you are. Thank you for allowing me to be part of your journey. In this complicated world, my feelings for you are the simplest, truest thing I know.\n\nWith all my heart,",
      };

      // Set the AI-generated letter based on selected mood
      setLetterData((prev) => ({
        ...prev,
        message: aiLetters[selectedMood] || aiLetters.romantic,
      }));

      toast({
        title: "Letter Generated",
        description: `Your ${selectedMood} love letter has been created. Feel free to edit it further.`,
      });
    } catch (error) {
      console.error("Error generating AI letter:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate your letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
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
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden my-8">
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
                  freely or use our AI assistant to help you.
                </p>
              </div>

              {/* AI Writing Assistant */}
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 className="h-5 w-5 text-pink-500" />
                  <h3 className="font-medium text-pink-800">
                    AI Writing Assistant
                  </h3>
                </div>

                <div className="mb-3">
                  <Label
                    htmlFor="mood-select"
                    className="text-sm text-gray-600 mb-1 block"
                  >
                    Select the mood for your letter:
                  </Label>
                  <Select value={selectedMood} onValueChange={setSelectedMood}>
                    <SelectTrigger className="w-full border-pink-200 focus:border-pink-400 focus:ring-pink-400">
                      <SelectValue placeholder="Select a mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="romantic">Romantic</SelectItem>
                      <SelectItem value="passionate">Passionate</SelectItem>
                      <SelectItem value="poetic">Poetic</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                      <SelectItem value="nostalgic">Nostalgic</SelectItem>
                      <SelectItem value="heartfelt">Heartfelt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={generateAILetter}
                  disabled={isGeneratingAI}
                  className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Love Letter
                    </>
                  )}
                </Button>
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
                    <p className="text-pink-700 font-medium mt-2">₹799</p>
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
                    <p className="text-pink-700 font-medium mt-2">₹1,199</p>
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
                    <p className="text-pink-700 font-medium mt-2">₹1,999</p>
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
                            ? "₹799"
                            : letterData.deliverySpeed === "express"
                              ? "₹1,199"
                              : "₹1,999"}
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0 || isLoading || isSaving}
                className="border-pink-300 text-pink-700 hover:bg-pink-50"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              <Button
                variant="outline"
                onClick={saveDraft}
                disabled={isLoading || isSaving}
                className="border-pink-300 text-pink-700 hover:bg-pink-50"
              >
                <Save className="mr-2 h-4 w-4" />{" "}
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>

              {currentStep === 0 && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="border-pink-300 text-pink-700 hover:bg-pink-50"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Home
                </Button>
              )}
            </div>

            <Button
              onClick={nextStep}
              disabled={isLoading || isSaving}
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
