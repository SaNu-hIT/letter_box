import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Edit, Trash2, Send, Eye, Heart } from "lucide-react";
import { LetterData } from "./LetterCreationForm";

const MyLetters: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [letters, setLetters] = useState<LetterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLetters();
  }, [user]);

  const loadLetters = async () => {
    try {
      setIsLoading(true);

      if (user) {
        // Try to load from Supabase first
        try {
          const { getUserLetters } = await import("@/services/letters");
          const supabaseLetters = await getUserLetters(user.id);
          setLetters(supabaseLetters);
          return;
        } catch (supabaseError) {
          console.error(
            "Error loading from Supabase, falling back to localStorage",
            supabaseError,
          );
          // If Supabase fails, fall back to localStorage
        }

        // Fallback: Load from localStorage
        const savedDrafts = JSON.parse(
          localStorage.getItem("letterDrafts") || "[]",
        );
        const sentLetters = JSON.parse(
          localStorage.getItem("sentLetters") || "[]",
        );

        console.log("Drafts from localStorage:", savedDrafts);
        console.log("Sent letters from localStorage:", sentLetters);

        // Filter letters belonging to the current user
        const userLetters = [...savedDrafts, ...sentLetters].filter(
          (letter: LetterData) => letter.userId === user?.id,
        );
        setLetters(userLetters);
      } else {
        setLetters([]);
      }
    } catch (error) {
      console.error("Error loading letters:", error);
      toast({
        title: "Error",
        description: "Failed to load your letters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLetter = async (id: string) => {
    try {
      // This would be replaced with an actual API call
      // For now, we'll simulate deleting from localStorage
      const savedDrafts = JSON.parse(
        localStorage.getItem("letterDrafts") || "[]",
      );
      const updatedDrafts = savedDrafts.filter(
        (draft: LetterData) => draft.id !== id,
      );
      localStorage.setItem("letterDrafts", JSON.stringify(updatedDrafts));

      // Update the UI
      setLetters(letters.filter((letter) => letter.id !== id));

      toast({
        title: "Letter deleted",
        description: "Your letter has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting letter:", error);
      toast({
        title: "Error",
        description: "Failed to delete your letter. Please try again.",
        variant: "destructive",
      });
    }
  };

  const editDraft = (id: string) => {
    navigate(`/create?draftId=${id}`);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      replied: "bg-pink-100 text-pink-800",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-serif text-pink-800 mb-4">
          Please Log In
        </h2>
        <p className="text-gray-600 mb-6">
          You need to be logged in to view your letters.
        </p>
        <Button
          onClick={() => navigate("/login")}
          className="bg-pink-500 hover:bg-pink-600 text-white"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl my-8">
      <h1 className="text-3xl font-serif text-pink-800 mb-6">My Letters</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="all">All Letters</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="sent">Sent Letters</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your letters...</p>
          </div>
        ) : letters.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-8 shadow-sm border border-pink-100">
            <div className="mb-6">
              <Send className="h-16 w-16 text-pink-300 mx-auto mb-4" />
              <h3 className="text-xl font-serif text-pink-800 mb-2">
                No Letters Found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                You don't have any letters yet. Start creating your first
                anonymous love letter now!
              </p>
            </div>
            <Button
              onClick={() => navigate("/create")}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-2"
            >
              <Heart className="mr-2 h-4 w-4" /> Create New Letter
            </Button>
          </div>
        ) : (
          <>
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {letters.map((letter) => (
                  <LetterCard
                    key={letter.id}
                    letter={letter}
                    onDelete={deleteLetter}
                    onEdit={editDraft}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="drafts" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {letters
                  .filter((letter) => letter.isDraft)
                  .map((letter) => (
                    <LetterCard
                      key={letter.id}
                      letter={letter}
                      onDelete={deleteLetter}
                      onEdit={editDraft}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="sent" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {letters
                  .filter((letter) => !letter.isDraft)
                  .map((letter) => (
                    <LetterCard
                      key={letter.id}
                      letter={letter}
                      onDelete={deleteLetter}
                      onEdit={editDraft}
                    />
                  ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      <div className="mt-8 text-center">
        <Button
          onClick={() => navigate("/create")}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
        >
          <Send className="mr-2 h-4 w-4" /> Create New Letter
        </Button>
      </div>
    </div>
  );
};

interface LetterCardProps {
  letter: LetterData;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const LetterCard: React.FC<LetterCardProps> = ({
  letter,
  onDelete,
  onEdit,
}) => {
  const navigate = useNavigate();
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-serif text-pink-800">
            {letter.recipientName
              ? `To: ${letter.recipientName}`
              : "Unnamed Letter"}
          </CardTitle>
          {letter.status && !letter.isDraft && getStatusBadge(letter.status)}
          {letter.isDraft && (
            <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-gray-600 mb-2 text-sm">
          <strong>Style:</strong>{" "}
          {letter.style.charAt(0).toUpperCase() + letter.style.slice(1)}
        </p>
        <p className="text-gray-700 mb-4 italic">
          "{truncateText(letter.message, 100)}"
        </p>
        {letter.createdAt && (
          <p className="text-xs text-gray-500">
            {letter.isDraft ? "Last edited" : "Sent"}:{" "}
            {formatDate(letter.createdAt)}
          </p>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 flex justify-between pt-3 pb-3">
        {letter.isDraft ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(letter.id || "")}
              className="text-pink-700 border-pink-200 hover:bg-pink-50"
            >
              <Edit className="mr-1 h-4 w-4" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(letter.id || "")}
              className="text-red-700 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/track?code=${letter.id}`)}
              className="text-purple-700 border-purple-200 hover:bg-purple-50"
            >
              <Eye className="mr-1 h-4 w-4" /> Track
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
              disabled
            >
              {letter.status}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default MyLetters;
