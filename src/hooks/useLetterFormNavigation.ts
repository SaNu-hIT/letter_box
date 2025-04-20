import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { LetterData } from "@/components/LetterCreationForm";

interface UseLetterFormNavigationProps {
  initialStep?: number;
  isReplyMode?: boolean;
  letterData: LetterData;
  onComplete?: (letterData: LetterData) => void;
  validateAddress?: () => boolean;
  saveDraft?: () => Promise<void>;
}

export const useLetterFormNavigation = ({
  initialStep = 0,
  isReplyMode = false,
  letterData,
  onComplete = () => {},
  validateAddress = () => true,
  saveDraft = async () => {},
}: UseLetterFormNavigationProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Define steps based on mode
  const steps = isReplyMode
    ? [
        { title: "Write Reply", icon: "Heart" },
        { title: "Select Style", icon: "Sparkles" },
        { title: "Delivery Options", icon: "ChevronRight" },
        { title: "Preview", icon: "Eye" },
      ]
    : [
        { title: "Write Message", icon: "Heart" },
        { title: "Select Style", icon: "Sparkles" },
        { title: "Recipient Details", icon: "Send" },
        { title: "Delivery Options", icon: "ChevronRight" },
        { title: "Preview", icon: "Eye" },
      ];

  const nextStep = async () => {
    // Validate fields based on current step
    if (currentStep === 2 && !isReplyMode) {
      // Address validation step
      if (!validateAddress()) {
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - handle both authenticated and anonymous users
      // For reply mode, call onComplete directly instead of navigating to payment
      if (isReplyMode) {
        onComplete(letterData);
        return;
      }

      // Navigate to payment page with the letter data
      navigate("/payment", { state: { letterData } });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToHome = () => {
    navigate("/");
  };

  return {
    currentStep,
    setCurrentStep,
    steps,
    nextStep,
    prevStep,
    goToHome,
  };
};

export default useLetterFormNavigation;
