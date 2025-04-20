import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAddressManagement } from "../hooks/useAddressManagement";
import { useLetterFormNavigation } from "../hooks/useLetterFormNavigation";
import AddressSelection from "./AddressSelection";
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
  CheckCircle,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import LetterPreview from "./LetterPreview";
import {
  getPricingOptions,
  fallbackPricingOptions,
  PricingOption,
} from "@/services/pricing";

interface LetterCreationFormProps {
  onComplete?: (letterData: LetterData) => void;
  draftId?: string;
  initialData?: LetterData;
  isReplyMode?: boolean;
  pricingOptions?: PricingOption[];
  isLoadingPricing?: boolean;
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
  pricingOptionId?: string;
  price?: number;
  pricingDetails?: {
    name: string;
    deliveryDays: string;
    deliverySpeed: string;
  };
  senderAddress?: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    saveAddress?: boolean;
  };
  recipientAddressDetails?: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  originalLetterId?: string;
}

const LetterCreationForm: React.FC<LetterCreationFormProps> = ({
  onComplete = () => {},
  draftId,
  initialData,
  isReplyMode = false,
  pricingOptions: propPricingOptions,
  isLoadingPricing: propIsLoadingPricing = false,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    savedAddresses,
    isLoadingAddresses,
    isUpdatingAddress,
    isDeletingAddress,
    selectedFromAddressId,
    setSelectedFromAddressId,
    loadSavedAddresses,
    saveAddress,
    editAddress,
    removeAddress,
    getSelectedAddress,
    emptyAddress,
  } = useAddressManagement();

  const [letterData, setLetterData] = useState<LetterData>(
    initialData || {
      message: "",
      style: "classic",
      recipientName: "",
      recipientAddress: "", // Will be constructed from recipientAddressDetails fields
      deliverySpeed: "standard",
      isDraft: true,
      pricingOptionId: "", // Will be set after loading pricing options
      senderAddress: {
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "India",
        saveAddress: true,
      },
      recipientAddressDetails: {
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "India",
      },
      // In the future, we'll add a separate fromAddress field here
    },
  );

  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>(
    propPricingOptions || [],
  );
  const [isLoadingPricing, setIsLoadingPricing] =
    useState(propIsLoadingPricing);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(draftId ? true : false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedMood, setSelectedMood] = useState("romantic");

  // Validate address function for the navigation hook
  const validateAddress = () => {
    // Only validate if no address is selected from saved addresses
    if (!selectedFromAddressId) {
      const { address, city, state, zip, country } =
        letterData.senderAddress || {};

      if (!address || !city || !state || !zip || !country) {
        toast({
          title: "Incomplete Address",
          description:
            "Please fill in all required address fields before continuing.",
          variant: "destructive",
        });
        return false;
      }

      if (zip.length < 6) {
        toast({
          title: "Invalid PIN Code",
          description: "PIN code must be 6 digits.",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  // Define saveDraft function before using it in the hook
  const saveDraft = async () => {
    // Allow anonymous users to save drafts
    if (!user) {
      try {
        setIsSaving(true);
        const draftToSave = {
          ...letterData,
          id: letterData.id || `draft-${Date.now()}`,
          updatedAt: new Date().toISOString(),
          createdAt: letterData.createdAt || new Date().toISOString(),
          isDraft: true,
        };

        // Save to localStorage for anonymous users
        const savedDrafts = JSON.parse(
          localStorage.getItem("letterDrafts") || "[]",
        );
        const existingDraftIndex = savedDrafts.findIndex(
          (d) => d.id === draftToSave.id,
        );

        if (existingDraftIndex >= 0) {
          savedDrafts[existingDraftIndex] = draftToSave;
        } else {
          savedDrafts.push(draftToSave);
        }

        localStorage.setItem("letterDrafts", JSON.stringify(savedDrafts));

        // Clear the form fields after saving
        setLetterData({
          ...draftToSave,
          message: "",
          recipientName: "",
          recipientAddress: "",
          recipientAddressDetails: {
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "India",
          },
          senderAddress: {
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "India",
            saveAddress: true,
          },
        });

        toast({
          title: "Draft saved",
          description: "Your letter has been saved as a draft in your browser.",
        });
        setIsSaving(false);
        return;
      } catch (error) {
        console.error("Error saving anonymous draft:", error);
        toast({
          title: "Error",
          description: "Failed to save your draft. Please try again.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
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

        let savedOrUpdatedLetter;
        if (!draftToSave.id || draftToSave.id.startsWith("draft-")) {
          // For new drafts or localStorage drafts
          savedOrUpdatedLetter = await saveLetter(draftToSave);
        } else {
          // For existing Supabase drafts
          savedOrUpdatedLetter = await updateLetter(
            draftToSave.id,
            draftToSave,
          );
        }

        // Clear the form fields after saving
        setLetterData({
          ...savedOrUpdatedLetter,
          message: "",
          recipientName: "",
          recipientAddress: "",
          recipientAddressDetails: {
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "India",
          },
          senderAddress: {
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "India",
            saveAddress: true,
          },
        });
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

        // Clear the form fields after saving
        setLetterData({
          ...draftToSave,
          message: "",
          recipientName: "",
          recipientAddress: "",
          recipientAddressDetails: {
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "India",
          },
          senderAddress: {
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "India",
            saveAddress: true,
          },
        });
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

  // Use the navigation hook
  const { currentStep, setCurrentStep, steps, nextStep, prevStep, goToHome } =
    useLetterFormNavigation({
      initialStep: 0,
      isReplyMode,
      letterData,
      onComplete,
      validateAddress,
      saveDraft,
    });

  // Map the step icons
  const stepsWithIcons = steps.map((step) => {
    let icon;
    switch (step.icon) {
      case "Heart":
        icon = <Heart className="h-5 w-5" />;
        break;
      case "Sparkles":
        icon = <Sparkles className="h-5 w-5" />;
        break;
      case "Send":
        icon = <Send className="h-5 w-5" />;
        break;
      case "ChevronRight":
        icon = <ChevronRight className="h-5 w-5" />;
        break;
      case "Eye":
        icon = <Eye className="h-5 w-5" />;
        break;
      default:
        icon = <ChevronRight className="h-5 w-5" />;
    }
    return { ...step, icon };
  });

  const handleInputChange = (field: keyof LetterData, value: string) => {
    setLetterData((prev) => ({ ...prev, [field]: value }));
  };

  // Update sender address fields
  const updateAddressField = (
    field: keyof typeof letterData.senderAddress,
    value: string,
  ) => {
    setLetterData((prev) => ({
      ...prev,
      senderAddress: {
        ...prev.senderAddress!,
        [field]: value,
      },
    }));
  };

  // Update recipient address fields and sync with recipientAddress string
  const updateRecipientAddressField = (
    field: keyof typeof letterData.recipientAddressDetails,
    value: string,
  ) => {
    setLetterData((prev) => {
      const updatedRecipientAddress = {
        ...prev.recipientAddressDetails!,
        [field]: value,
      };

      // Format the complete address for recipientAddress
      const formattedAddress = `${updatedRecipientAddress.address || ""}\n${updatedRecipientAddress.city || ""}${updatedRecipientAddress.city ? ", " : ""}${updatedRecipientAddress.state || ""}${updatedRecipientAddress.state ? " " : ""}${updatedRecipientAddress.zip || ""}${updatedRecipientAddress.country ? "\n" + updatedRecipientAddress.country : ""}`;

      return {
        ...prev,
        recipientAddressDetails: updatedRecipientAddress,
        recipientAddress: formattedAddress,
      };
    });
  };

  // Load draft if draftId is provided
  useEffect(() => {
    // Skip loading draft if initialData is provided (for reply mode)
    if (initialData) return;

    const params = new URLSearchParams(window.location.search);
    const queryDraftId = params.get("draftId");
    const locationState = window.history.state?.usr?.draftId;
    const packageId = params.get("package");

    const draftToLoad = draftId || queryDraftId || locationState;

    if (draftToLoad) {
      console.log("Loading draft with ID:", draftToLoad);
      loadDraft(draftToLoad);
    }

    // Load pricing options first
    loadPricingOptions().then(() => {
      // If a package ID was provided in the URL, find the matching pricing option
      if (packageId) {
        // Find the pricing option by name (case insensitive)
        const matchingOption = pricingOptions.find(
          (option) => option.name.toLowerCase() === packageId.toLowerCase(),
        );

        if (matchingOption) {
          setLetterData((prev) => ({
            ...prev,
            pricingOptionId: matchingOption.id,
            deliverySpeed: matchingOption.delivery_speed || "standard",
          }));
        }
      }
    });
  }, [draftId]);

  // Load pricing options from the database
  const loadPricingOptions = async () => {
    // If pricing options were provided as props (for reply mode), use those
    if (propPricingOptions && propPricingOptions.length > 0) {
      setPricingOptions(propPricingOptions);

      // Set the default pricing option ID if not already set
      if (!letterData.pricingOptionId) {
        setLetterData((prev) => ({
          ...prev,
          pricingOptionId: propPricingOptions[0].id,
          deliverySpeed: propPricingOptions[0].delivery_speed || "standard",
        }));
      }
      return;
    }

    try {
      setIsLoadingPricing(true);
      const options = await getPricingOptions();
      if (options && options.length > 0) {
        // Sort by sort_order if available
        const sortedOptions = [...options].sort((a, b) => {
          if (a.sort_order !== undefined && b.sort_order !== undefined) {
            return a.sort_order - b.sort_order;
          }
          return 0;
        });
        setPricingOptions(sortedOptions);
        console.log("Loaded pricing options:", sortedOptions);

        // Set the default pricing option ID to the first option's ID
        if (sortedOptions.length > 0 && !letterData.pricingOptionId) {
          setLetterData((prev) => ({
            ...prev,
            pricingOptionId: sortedOptions[0].id,
            deliverySpeed: sortedOptions[0].delivery_speed || "standard",
          }));
        }
      } else {
        setPricingOptions(fallbackPricingOptions);
        // Set the default pricing option ID to the first fallback option's ID
        if (!letterData.pricingOptionId) {
          setLetterData((prev) => ({
            ...prev,
            pricingOptionId: fallbackPricingOptions[0].id,
            deliverySpeed:
              fallbackPricingOptions[0].delivery_speed || "standard",
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching pricing options:", error);
      // Use fallback pricing options
      setPricingOptions(fallbackPricingOptions);
      // Set the default pricing option ID to the first fallback option's ID
      if (!letterData.pricingOptionId) {
        setLetterData((prev) => ({
          ...prev,
          pricingOptionId: fallbackPricingOptions[0].id,
          deliverySpeed: fallbackPricingOptions[0].delivery_speed || "standard",
        }));
      }
      toast({
        title: "Notice",
        description:
          "Using default pricing. Latest pricing information could not be loaded.",
        variant: "default",
      });
    } finally {
      setIsLoadingPricing(false);
    }
  };

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

  // Navigation functions are now handled by the useLetterFormNavigation hook

  const generateAILetter = async () => {
    setIsGeneratingAI(true);
    try {
      // Try to use Supabase Edge Function if available
      try {
        const { supabase } = await import("@/services/auth");
        const { data, error } = await supabase.functions.invoke(
          "generate-letter",
          {
            body: {
              mood: selectedMood,
              recipientName: letterData.recipientName || "beloved",
            },
          },
        );

        if (!error && data?.message) {
          setLetterData((prev) => ({
            ...prev,
            message: data.message,
          }));

          toast({
            title: "Letter Generated",
            description: `Your ${selectedMood} love letter has been created. Feel free to edit it further.`,
          });
          return;
        }
      } catch (edgeFunctionError) {
        console.log(
          "Edge function not available, using fallback",
          edgeFunctionError,
        );
      }

      // Fallback to local templates if edge function fails
      // Simulate API call to AI service
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

      // Personalize the letter if recipient name is available
      let message = aiLetters[selectedMood] || aiLetters.romantic;
      if (letterData.recipientName) {
        message = message
          .replace("beloved", letterData.recipientName)
          .replace("dearest", letterData.recipientName)
          .replace("cherished one", letterData.recipientName);
      }

      // Set the AI-generated letter based on selected mood
      setLetterData((prev) => ({
        ...prev,
        message: message,
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
          {stepsWithIcons.map((step, index) => (
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
              {isReplyMode && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                  <p className="text-purple-800 font-medium">
                    You are replying to Letter #{letterData.originalLetterId}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Your reply will be sent anonymously to the original sender.
                  </p>
                </div>
              )}
              <div>
                <h2 className="text-2xl font-serif text-pink-800">
                  {isReplyMode ? "Write Your Reply" : "Pour Your Heart Out"}
                </h2>
                <p className="text-gray-600 mt-2">
                  {isReplyMode
                    ? "Write your anonymous reply below. Express your feelings freely or use our AI assistant to help you."
                    : "Write your anonymous love letter below. Express your feelings freely or use our AI assistant to help you."}
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
                    <SelectTrigger
                      id="mood-select"
                      className="w-full border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    >
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

          {/* Step 3: Recipient Details - Skip in reply mode */}
          {currentStep === 2 && !isReplyMode && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif text-pink-800">
                  Delivery Details
                </h2>
                <p className="text-gray-600 mt-2">
                  Enter the recipient's name and the address for delivery.
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

                <div className="mt-4 pt-4 border-t border-pink-100">
                  <h3 className="text-lg font-medium text-pink-800 mb-3">
                    Address Details
                  </h3>

                  {/* To Address Section */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-pink-700 mb-2 flex items-center">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-pink-100 text-pink-800 rounded-full mr-2 text-xs">
                        1
                      </span>
                      To Address (Recipient)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                      <div>
                        <Label htmlFor="recipient_address">
                          Street Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="recipient_address"
                          placeholder="123 Main St"
                          className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                          value={
                            letterData.recipientAddressDetails?.address || ""
                          }
                          onChange={(e) =>
                            updateRecipientAddressField(
                              "address",
                              e.target.value,
                            )
                          }
                          required
                        />
                        {!letterData.recipientAddressDetails?.address && (
                          <p className="text-xs text-red-500 mt-1">
                            Street address is required
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="recipient_city">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="recipient_city"
                          placeholder="Mumbai"
                          className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                          value={letterData.recipientAddressDetails?.city || ""}
                          onChange={(e) =>
                            updateRecipientAddressField("city", e.target.value)
                          }
                          required
                        />
                        {!letterData.recipientAddressDetails?.city && (
                          <p className="text-xs text-red-500 mt-1">
                            City is required
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="recipient_state">
                          State <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="recipient_state"
                          placeholder="Maharashtra"
                          className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                          value={
                            letterData.recipientAddressDetails?.state || ""
                          }
                          onChange={(e) =>
                            updateRecipientAddressField("state", e.target.value)
                          }
                          required
                        />
                        {!letterData.recipientAddressDetails?.state && (
                          <p className="text-xs text-red-500 mt-1">
                            State is required
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="recipient_zip">
                          PIN Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="recipient_zip"
                          placeholder="400001"
                          className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                          value={letterData.recipientAddressDetails?.zip || ""}
                          onChange={(e) => {
                            // Only allow numbers for PIN code
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            updateRecipientAddressField("zip", value);
                          }}
                          maxLength={6}
                          required
                        />
                        {!letterData.recipientAddressDetails?.zip && (
                          <p className="text-xs text-red-500 mt-1">
                            PIN code is required
                          </p>
                        )}
                        {letterData.recipientAddressDetails?.zip &&
                          letterData.recipientAddressDetails.zip.length < 6 && (
                            <p className="text-xs text-red-500 mt-1">
                              PIN code must be 6 digits
                            </p>
                          )}
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="recipient_country">
                          Country <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="recipient_country"
                          placeholder="India"
                          className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                          value={
                            letterData.recipientAddressDetails?.country ||
                            "India"
                          }
                          onChange={(e) =>
                            updateRecipientAddressField(
                              "country",
                              e.target.value,
                            )
                          }
                          required
                        />
                        {!letterData.recipientAddressDetails?.country && (
                          <p className="text-xs text-red-500 mt-1">
                            Country is required
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* From Address Section */}
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-pink-700 mb-2 flex items-center">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-pink-100 text-pink-800 rounded-full mr-2 text-xs">
                        2
                      </span>
                      From Address (Sender)
                    </h4>
                    <div className="pl-7">
                      <p className="text-gray-600 mb-4 text-sm">
                        Your address will be kept private.
                      </p>

                      {user && (
                        <AddressSelection
                          savedAddresses={savedAddresses}
                          isLoadingAddresses={isLoadingAddresses}
                          isUpdatingAddress={isUpdatingAddress}
                          isDeletingAddress={isDeletingAddress}
                          selectedFromAddressId={selectedFromAddressId}
                          setSelectedFromAddressId={setSelectedFromAddressId}
                          onAddressSelect={(address) => {
                            setLetterData((prev) => ({
                              ...prev,
                              senderAddress: {
                                address: address.address,
                                city: address.city,
                                state: address.state,
                                zip: address.zip,
                                country: address.country,
                                saveAddress: false,
                              },
                            }));
                          }}
                          onAddressEdit={editAddress}
                          onAddressDelete={removeAddress}
                          onAddNewAddress={() => {
                            // Only validate if not using a selected address
                            if (!selectedFromAddressId) {
                              const { address, city, state, zip, country } =
                                letterData.senderAddress || {};

                              if (
                                !address ||
                                !city ||
                                !state ||
                                !zip ||
                                !country
                              ) {
                                toast({
                                  title: "Incomplete Address",
                                  description:
                                    "Please fill in all required address fields before saving.",
                                  variant: "destructive",
                                });
                                return;
                              }

                              if (zip.length < 6) {
                                toast({
                                  title: "Invalid PIN Code",
                                  description: "PIN code must be 6 digits.",
                                  variant: "destructive",
                                });
                                return;
                              }
                            }

                            // Save the current address
                            const { address, city, state, zip, country } =
                              letterData.senderAddress || {};
                            const addressToSave = {
                              address,
                              city,
                              state,
                              zip,
                              country,
                              is_default: savedAddresses.length === 0, // Make it default if it's the first address
                            };

                            saveAddress(addressToSave).then((success) => {
                              if (success) {
                                // Reset the saveAddress flag and clear all address fields
                                setLetterData((prev) => ({
                                  ...prev,
                                  senderAddress: {
                                    address: "",
                                    city: "",
                                    state: "",
                                    zip: "",
                                    country: "India",
                                    saveAddress: false,
                                  },
                                }));
                                toast({
                                  title: "Address Saved",
                                  description:
                                    "Your address has been saved and fields have been cleared.",
                                });
                              }
                            });
                          }}
                        />
                      )}

                      {/* From Address Form Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sender_address">
                            Street Address{" "}
                            {!selectedFromAddressId && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          <Input
                            id="sender_address"
                            placeholder="123 Main St"
                            className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                            value={letterData.senderAddress?.address || ""}
                            onChange={(e) =>
                              updateAddressField("address", e.target.value)
                            }
                            required={!selectedFromAddressId}
                          />
                          {!selectedFromAddressId &&
                            !letterData.senderAddress?.address && (
                              <p className="text-xs text-red-500 mt-1">
                                Street address is required
                              </p>
                            )}
                        </div>
                        <div>
                          <Label htmlFor="sender_city">
                            City{" "}
                            {!selectedFromAddressId && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          <Input
                            id="sender_city"
                            placeholder="Mumbai"
                            className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                            value={letterData.senderAddress?.city || ""}
                            onChange={(e) =>
                              updateAddressField("city", e.target.value)
                            }
                            required={!selectedFromAddressId}
                          />
                          {!selectedFromAddressId &&
                            !letterData.senderAddress?.city && (
                              <p className="text-xs text-red-500 mt-1">
                                City is required
                              </p>
                            )}
                        </div>
                        <div>
                          <Label htmlFor="sender_state">
                            State{" "}
                            {!selectedFromAddressId && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          <Input
                            id="sender_state"
                            placeholder="Maharashtra"
                            className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                            value={letterData.senderAddress?.state || ""}
                            onChange={(e) =>
                              updateAddressField("state", e.target.value)
                            }
                            required={!selectedFromAddressId}
                          />
                          {!selectedFromAddressId &&
                            !letterData.senderAddress?.state && (
                              <p className="text-xs text-red-500 mt-1">
                                State is required
                              </p>
                            )}
                        </div>
                        <div>
                          <Label htmlFor="sender_zip">
                            PIN Code{" "}
                            {!selectedFromAddressId && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          <Input
                            id="sender_zip"
                            placeholder="400001"
                            className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                            value={letterData.senderAddress?.zip || ""}
                            onChange={(e) => {
                              // Only allow numbers for PIN code
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                "",
                              );
                              updateAddressField("zip", value);
                            }}
                            maxLength={6}
                            required={!selectedFromAddressId}
                          />
                          {!selectedFromAddressId &&
                            !letterData.senderAddress?.zip && (
                              <p className="text-xs text-red-500 mt-1">
                                PIN code is required
                              </p>
                            )}
                          {!selectedFromAddressId &&
                            letterData.senderAddress?.zip &&
                            letterData.senderAddress.zip.length < 6 && (
                              <p className="text-xs text-red-500 mt-1">
                                PIN code must be 6 digits
                              </p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="sender_country">
                            Country{" "}
                            {!selectedFromAddressId && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          <Input
                            id="sender_country"
                            placeholder="India"
                            className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                            value={letterData.senderAddress?.country || "India"}
                            onChange={(e) =>
                              updateAddressField("country", e.target.value)
                            }
                            required={!selectedFromAddressId}
                          />
                          {!selectedFromAddressId &&
                            !letterData.senderAddress?.country && (
                              <p className="text-xs text-red-500 mt-1">
                                Country is required
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="flex items-center mt-4">
                        <input
                          type="checkbox"
                          id="saveAddress"
                          className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          checked={
                            letterData.senderAddress?.saveAddress || false
                          }
                          onChange={(e) => {
                            setLetterData((prev) => ({
                              ...prev,
                              senderAddress: {
                                ...prev.senderAddress!,
                                saveAddress: e.target.checked,
                              },
                            }));
                          }}
                        />
                        <label
                          htmlFor="saveAddress"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Save this address to my account for future letters
                        </label>
                      </div>

                      {user && (
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-pink-200 text-pink-700 hover:bg-pink-50"
                            onClick={() => {
                              // Only validate if not using a selected address
                              if (!selectedFromAddressId) {
                                const { address, city, state, zip, country } =
                                  letterData.senderAddress || {};

                                if (
                                  !address ||
                                  !city ||
                                  !state ||
                                  !zip ||
                                  !country
                                ) {
                                  toast({
                                    title: "Incomplete Address",
                                    description:
                                      "Please fill in all required address fields before saving.",
                                    variant: "destructive",
                                  });
                                  return;
                                }

                                if (zip.length < 6) {
                                  toast({
                                    title: "Invalid PIN Code",
                                    description: "PIN code must be 6 digits.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                              }

                              // Save the current address
                              const { address, city, state, zip, country } =
                                letterData.senderAddress || {};
                              const addressToSave = {
                                address,
                                city,
                                state,
                                zip,
                                country,
                                is_default: savedAddresses.length === 0, // Make it default if it's the first address
                              };

                              saveAddress(addressToSave).then((success) => {
                                if (success) {
                                  // Reset the saveAddress flag and clear all address fields
                                  setLetterData((prev) => ({
                                    ...prev,
                                    senderAddress: {
                                      address: "",
                                      city: "",
                                      state: "",
                                      zip: "",
                                      country: "India",
                                      saveAddress: false,
                                    },
                                  }));
                                  toast({
                                    title: "Address Saved",
                                    description:
                                      "Your address has been saved and fields have been cleared.",
                                  });
                                }
                              });
                            }}
                          >
                            <span className="mr-2">+</span> Add New Address
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 italic">
                We handle all deliveries with care and discretion.
              </p>
            </div>
          )}

          {/* Step 4: Delivery Options - Skip in reply mode */}
          {currentStep === 3 && !isReplyMode && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif text-pink-800">
                  Delivery Options
                </h2>
                <p className="text-gray-600 mt-2">
                  Choose how quickly you want your letter to be delivered.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">
                  Select a Delivery Package
                </h3>
                <p className="text-gray-600 mb-4">
                  Choose the package that best suits your needs.
                </p>
              </div>

              {isLoadingPricing ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 text-pink-500 animate-spin" />
                  <span className="ml-2 text-pink-700">
                    Loading pricing options...
                  </span>
                </div>
              ) : (
                <RadioGroup
                  value={letterData.pricingOptionId || ""}
                  onValueChange={(value) => {
                    // Set the pricing option ID
                    handleInputChange("pricingOptionId", value);

                    // Find the selected pricing option to get its delivery speed
                    const selectedOption = pricingOptions.find(
                      (option) => option.id === value,
                    );
                    if (selectedOption && selectedOption.delivery_speed) {
                      handleInputChange(
                        "deliverySpeed",
                        selectedOption.delivery_speed,
                      );
                    } else {
                      // Fallback for backward compatibility
                      if (value === "00000000-0000-0000-0000-000000000001")
                        handleInputChange("deliverySpeed", "standard");
                      else if (value === "00000000-0000-0000-0000-000000000002")
                        handleInputChange("deliverySpeed", "express");
                      else if (value === "00000000-0000-0000-0000-000000000003")
                        handleInputChange("deliverySpeed", "overnight");
                      else handleInputChange("deliverySpeed", value);
                    }
                  }}
                  className="space-y-4"
                >
                  {pricingOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-pink-50 transition-colors cursor-pointer ${option.is_popular ? "border-purple-300 bg-purple-50" : ""}`}
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor={option.id}
                            className="text-lg font-medium cursor-pointer"
                          >
                            {option.name}
                            {option.is_popular && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                                Most Popular
                              </span>
                            )}
                          </Label>
                        </div>
                        <p className="text-gray-600 mt-1">
                          {option.description}
                        </p>
                        <div className="mt-2">
                          {option.delivery_days && (
                            <p className="text-gray-600 text-sm">
                              Delivery: {option.delivery_days}
                            </p>
                          )}
                          <p className="text-pink-700 font-medium mt-1">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            }).format(option.price)}
                          </p>
                        </div>
                        <ul className="mt-3 space-y-1">
                          {option.features.map((feature, i) => (
                            <li key={i} className="flex items-start text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          )}

          {/* Delivery Options Step for Reply Mode */}
          {isReplyMode && currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif text-pink-800">
                  Delivery Options
                </h2>
                <p className="text-gray-600 mt-2">
                  Choose how quickly you want your reply to be delivered.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">
                  Select a Delivery Package
                </h3>
                <p className="text-gray-600 mb-4">
                  Choose the package that best suits your needs.
                </p>
              </div>

              {isLoadingPricing ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 text-pink-500 animate-spin" />
                  <span className="ml-2 text-pink-700">
                    Loading pricing options...
                  </span>
                </div>
              ) : (
                <RadioGroup
                  value={letterData.pricingOptionId || ""}
                  onValueChange={(value) => {
                    // Set the pricing option ID
                    handleInputChange("pricingOptionId", value);

                    // Find the selected pricing option to get its delivery speed
                    const selectedOption = pricingOptions.find(
                      (option) => option.id === value,
                    );
                    if (selectedOption && selectedOption.delivery_speed) {
                      handleInputChange(
                        "deliverySpeed",
                        selectedOption.delivery_speed,
                      );
                    } else {
                      // Fallback for backward compatibility
                      if (value === "00000000-0000-0000-0000-000000000001")
                        handleInputChange("deliverySpeed", "standard");
                      else if (value === "00000000-0000-0000-0000-000000000002")
                        handleInputChange("deliverySpeed", "express");
                      else if (value === "00000000-0000-0000-0000-000000000003")
                        handleInputChange("deliverySpeed", "overnight");
                      else handleInputChange("deliverySpeed", value);
                    }
                  }}
                  className="space-y-4"
                >
                  {pricingOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-pink-50 transition-colors cursor-pointer ${option.is_popular ? "border-purple-300 bg-purple-50" : ""}`}
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor={option.id}
                            className="text-lg font-medium cursor-pointer"
                          >
                            {option.name}
                            {option.is_popular && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                                Most Popular
                              </span>
                            )}
                          </Label>
                        </div>
                        <p className="text-gray-600 mt-1">
                          {option.description}
                        </p>
                        <div className="mt-2">
                          {option.delivery_days && (
                            <p className="text-gray-600 text-sm">
                              Delivery: {option.delivery_days}
                            </p>
                          )}
                          <p className="text-pink-700 font-medium mt-1">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            }).format(option.price)}
                          </p>
                        </div>
                        <ul className="mt-3 space-y-1">
                          {option.features.map((feature, i) => (
                            <li key={i} className="flex items-start text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          )}

          {/* Preview Step (Step 5 in normal mode, Step 4 in reply mode) */}
          {((isReplyMode && currentStep === 3) ||
            (!isReplyMode && currentStep === 4)) && (
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
                  <div className="flex justify-center w-full">
                    <LetterPreview
                      message={letterData.message}
                      style={letterData.style}
                      recipientName={letterData.recipientName}
                      onEdit={(newMessage) =>
                        handleInputChange("message", newMessage)
                      }
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
                          {letterData.recipientAddress ||
                            `${letterData.recipientAddressDetails?.address || ""}\n${letterData.recipientAddressDetails?.city || ""}${letterData.recipientAddressDetails?.city ? ", " : ""}${letterData.recipientAddressDetails?.state || ""}${letterData.recipientAddressDetails?.state ? " " : ""}${letterData.recipientAddressDetails?.zip || ""}${letterData.recipientAddressDetails?.country ? "\n" + letterData.recipientAddressDetails.country : ""}`}
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
                          {(() => {
                            // Find the selected pricing option
                            const selectedOption = pricingOptions.find(
                              (option) =>
                                option.id === letterData.pricingOptionId,
                            );

                            if (selectedOption) {
                              return new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 0,
                              }).format(selectedOption.price);
                            } else {
                              // Fallback to hardcoded prices if option not found
                              return letterData.deliverySpeed === "standard"
                                ? "₹799"
                                : letterData.deliverySpeed === "express"
                                  ? "₹1,199"
                                  : "₹1,999";
                            }
                          })()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <p className="text-sm text-gray-500 italic">
                {isReplyMode
                  ? "Your reply will be sent anonymously to the original sender."
                  : "A unique QR code will be included with your letter for the recipient to reply anonymously."}
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
                  onClick={goToHome}
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
              {currentStep === stepsWithIcons.length - 1 ? (
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
