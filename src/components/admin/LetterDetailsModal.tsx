import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { supabase, type UserAddress } from "../../services/auth";
import { format } from "date-fns";
import {
  Loader2,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Palette,
  ArrowLeftRight,
  User,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

type Letter = {
  id: string;
  message: string;
  recipient_name: string;
  recipient_address: string;
  status: string;
  delivery_speed: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  style?: string;
  is_reply?: boolean;
  original_letter_id?: string;
};

interface LetterDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterId: string | null;
}

const LetterDetailsModal: React.FC<LetterDetailsModalProps> = ({
  isOpen,
  onClose,
  letterId,
}) => {
  const [letter, setLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [originalLetter, setOriginalLetter] = useState<Letter | null>(null);
  const [senderAddress, setSenderAddress] = useState<UserAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && letterId) {
      fetchLetterDetails(letterId);
    } else {
      setLetter(null);
      setOriginalLetter(null);
      setSenderAddress(null);
    }
  }, [isOpen, letterId]);

  const fetchLetterDetails = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("letters")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setLetter(data);

      // If this is a reply letter, fetch the original letter to get the address
      if (data.is_reply && data.original_letter_id) {
        fetchOriginalLetter(data.original_letter_id);
      }

      // Fetch sender's address if user_id is available
      if (data.user_id) {
        fetchSenderAddress(data.user_id);
      }
    } catch (error) {
      console.error("Error fetching letter details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOriginalLetter = async (originalId: string) => {
    try {
      const { data, error } = await supabase
        .from("letters")
        .select("*")
        .eq("id", originalId)
        .single();

      if (error) throw error;

      setOriginalLetter(data);
    } catch (error) {
      console.error("Error fetching original letter:", error);
    }
  };

  const fetchSenderAddress = async (userId: string) => {
    setLoadingAddress(true);
    try {
      // Get the default address for the user
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .eq("is_default", true)
        .single();

      if (error) {
        // If no default address found, try to get any address
        const { data: anyAddress, error: anyAddressError } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", userId)
          .limit(1)
          .single();

        if (!anyAddressError && anyAddress) {
          setSenderAddress(anyAddress);
        } else {
          console.error("No address found for user:", userId);
          setSenderAddress(null);
        }
      } else {
        setSenderAddress(data);
      }
    } catch (error) {
      console.error("Error fetching sender address:", error);
      setSenderAddress(null);
    } finally {
      setLoadingAddress(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Letter Details</DialogTitle>
          <DialogDescription>
            View the complete details of this letter.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : letter ? (
          <div className="space-y-6 py-4">
            {/* Header with ID and Status */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">ID:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                  {letter.id}
                </code>
              </div>
              <Badge
                className={`px-3 py-1 ${
                  letter.status === "pending"
                    ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800"
                    : letter.status === "printed"
                      ? "bg-blue-100 hover:bg-blue-100 text-blue-800"
                      : letter.status === "sent"
                        ? "bg-purple-100 hover:bg-purple-100 text-purple-800"
                        : "bg-green-100 hover:bg-green-100 text-green-800"
                }`}
              >
                {letter.status.toUpperCase()}
              </Badge>
            </div>

            <Separator />

            {/* Reply Letter Info */}
            {letter.is_reply && originalLetter && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <ArrowLeftRight className="h-4 w-4 text-purple-600" />
                  <h3 className="font-medium text-purple-800">Reply Letter</h3>
                </div>
                <p className="text-sm mb-2">
                  This is a reply to letter ID:{" "}
                  <code className="bg-purple-100 px-1 rounded">
                    {letter.original_letter_id}
                  </code>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <h4 className="text-xs font-medium text-purple-700">
                      Original Recipient
                    </h4>
                    <p className="text-sm">{originalLetter.recipient_name}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-purple-700">
                      Original Address
                    </h4>
                    <p className="text-sm whitespace-pre-line">
                      {originalLetter.recipient_address}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Letter Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Recipient
                    </h3>
                    <p className="text-base">{letter.recipient_name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Recipient Address
                    </h3>
                    <p className="text-base whitespace-pre-line">
                      {letter.recipient_address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Sender Address
                    </h3>
                    {loadingAddress ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <span className="text-sm text-gray-500">
                          Loading address...
                        </span>
                      </div>
                    ) : senderAddress ? (
                      <p className="text-base whitespace-pre-line">
                        {senderAddress.address}, {senderAddress.city},{" "}
                        {senderAddress.state} {senderAddress.zip},{" "}
                        {senderAddress.country}
                      </p>
                    ) : (
                      <p className="text-sm italic text-gray-500">
                        No address available
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Delivery Speed
                    </h3>
                    <p className="text-base">{letter.delivery_speed}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Palette className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Style</h3>
                    <p className="text-base">{letter.style || "Standard"}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Created
                    </h3>
                    <p className="text-base">
                      {format(new Date(letter.created_at), "PPpp")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Last Updated
                    </h3>
                    <p className="text-base">
                      {format(new Date(letter.updated_at), "PPpp")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Message Content */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Message
              </h3>
              <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
                <p className="text-base whitespace-pre-line leading-relaxed">
                  {letter.message}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500">
            No letter details found
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LetterDetailsModal;
