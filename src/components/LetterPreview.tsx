import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Edit, Check, X, Maximize2, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface LetterPreviewProps {
  message?: string;
  style?: string;
  letterStyle?: "classic" | "romantic" | "vintage" | "modern";
  recipientName?: string;
  onEdit?: (newMessage: string) => void;
}

const LetterPreview = ({
  message = "Dear beloved,\n\nWords cannot express how much you mean to me. Every moment spent with you is a treasure I hold close to my heart.\n\nForever yours,\nAn admirer",
  letterStyle = "classic",
  style = "classic",
  recipientName = "Dearest One",
  onEdit,
}: LetterPreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Define style variations based on letterStyle
  const letterStyles = {
    classic: {
      bgColor: "bg-amber-50",
      fontFamily: "font-serif",
      textColor: "text-gray-800",
      borderColor: "border-amber-200",
      texture:
        "bg-[url('https://images.unsplash.com/photo-1601641875191-33a8b8b75450?w=400&q=80')]",
      bgBlend: "bg-blend-overlay",
      opacity: "opacity-10",
    },
    romantic: {
      bgColor: "bg-pink-50",
      fontFamily: "font-serif italic",
      textColor: "text-rose-800",
      borderColor: "border-pink-200",
      texture:
        "bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80')]",
      bgBlend: "bg-blend-soft-light",
      opacity: "opacity-20",
    },
    vintage: {
      bgColor: "bg-amber-100",
      fontFamily: "font-serif",
      textColor: "text-amber-900",
      borderColor: "border-amber-300",
      texture:
        "bg-[url('https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400&q=80')]",
      bgBlend: "bg-blend-multiply",
      opacity: "opacity-20",
    },
    modern: {
      bgColor: "bg-slate-50",
      fontFamily: "font-sans",
      textColor: "text-slate-800",
      borderColor: "border-slate-200",
      texture:
        "bg-[url('https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=400&q=80')]",
      bgBlend: "bg-blend-overlay",
      opacity: "opacity-5",
    },
  };

  // Use letterStyle prop first, fall back to style prop for backward compatibility
  const styleKey = (letterStyle || style) as keyof typeof letterStyles;
  const currentStyle = letterStyles[styleKey];

  // Format message with line breaks
  const formattedMessage = message.split("\n").map((line, index) => (
    <span key={index}>
      {line}
      {index < message.split("\n").length - 1 && <br />}
    </span>
  ));

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(editedMessage);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedMessage(message);
    setIsEditing(false);
  };

  const letterContent = (
    <div className="flex flex-col items-center w-full max-w-full mx-auto bg-white p-4">
      <div className="text-sm text-gray-500 mb-2 self-start">Preview</div>

      <Card
        className={cn(
          "w-full h-[450px] overflow-hidden relative border-2 shadow-md transition-all duration-300",
          currentStyle.borderColor,
          isFullscreen ? "max-w-2xl mx-auto" : "max-w-full",
        )}
      >
        {/* Background texture */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full bg-repeat",
            currentStyle.texture,
            currentStyle.bgBlend,
            currentStyle.opacity,
          )}
        />

        {/* Edit, print and fullscreen buttons */}
        <div className="absolute top-2 right-2 z-20 flex gap-2">
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-white"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 text-gray-600" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-white"
            onClick={async () => {
              try {
                const { generateLetterPdf } = await import("@/services/pdf");
                await generateLetterPdf({
                  message,
                  recipientName,
                  style: letterStyle || style,
                  id: `preview-${Date.now()}`,
                });
              } catch (error) {
                console.error("Error printing letter:", error);
              }
            }}
          >
            <Printer className="h-4 w-4 text-gray-600" />
          </Button>
          <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-white"
              >
                <Maximize2 className="h-4 w-4 text-gray-600" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0">
              <DialogHeader className="p-4 border-b">
                <DialogTitle>Letter Preview</DialogTitle>
              </DialogHeader>
              <div className="p-6 h-[calc(100%-4rem)] overflow-auto flex justify-center items-start">
                <Card
                  className={cn(
                    "w-full max-w-2xl h-auto min-h-[600px] overflow-hidden relative border-2 shadow-md",
                    currentStyle.borderColor,
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 w-full h-full bg-repeat",
                      currentStyle.texture,
                      currentStyle.bgBlend,
                      currentStyle.opacity,
                    )}
                  />
                  <CardContent
                    className={cn(
                      "relative z-10 p-6 h-full flex flex-col",
                      currentStyle.bgColor,
                      currentStyle.fontFamily,
                    )}
                  >
                    <div className="flex-1 flex flex-col">
                      <div className="mb-6 text-right">
                        <div className="text-xs text-gray-400">To:</div>
                        <div className={cn("text-lg", currentStyle.textColor)}>
                          {recipientName}
                        </div>
                      </div>

                      <div
                        className={cn(
                          "flex-1 text-sm leading-relaxed overflow-y-auto",
                          currentStyle.textColor,
                        )}
                      >
                        {formattedMessage}
                      </div>

                      <div className="mt-6 text-right">
                        <div className={cn("italic", currentStyle.textColor)}>
                          With love,
                        </div>
                        <div
                          className={cn("text-sm mt-1", currentStyle.textColor)}
                        >
                          An anonymous admirer
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <div className="w-16 h-16 border border-gray-300 bg-white flex items-center justify-center">
                        <span className="text-xs text-gray-400">QR Code</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <CardContent
          className={cn(
            "relative z-10 p-6 h-full flex flex-col",
            currentStyle.bgColor,
            currentStyle.fontFamily,
          )}
        >
          {isEditing ? (
            <div className="flex-1 flex flex-col">
              <div className="mb-6 text-right">
                <div className="text-xs text-gray-400">To:</div>
                <div className={cn("text-lg", currentStyle.textColor)}>
                  {recipientName}
                </div>
              </div>

              <Textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className={cn(
                  "flex-1 mb-4 border-none focus-visible:ring-0 resize-none bg-transparent",
                  currentStyle.textColor,
                )}
              />

              <div className="flex justify-end gap-2 mt-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex items-center"
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  className="flex items-center bg-pink-500 hover:bg-pink-600"
                >
                  <Check className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>

              <div className="mt-4 flex justify-end">
                <div className="w-16 h-16 border border-gray-300 bg-white flex items-center justify-center">
                  <span className="text-xs text-gray-400">QR Code</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="mb-6 text-right">
                <div className="text-xs text-gray-400">To:</div>
                <div className={cn("text-lg", currentStyle.textColor)}>
                  {recipientName}
                </div>
              </div>

              <div
                className={cn(
                  "flex-1 text-sm leading-relaxed overflow-y-auto",
                  currentStyle.textColor,
                )}
              >
                {formattedMessage}
              </div>

              <div className="mt-6 text-right">
                <div className={cn("italic", currentStyle.textColor)}>
                  With love,
                </div>
                <div className={cn("text-sm mt-1", currentStyle.textColor)}>
                  An anonymous admirer
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <div className="w-16 h-16 border border-gray-300 bg-white flex items-center justify-center">
                  <span className="text-xs text-gray-400">QR Code</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Recipients can scan the QR code to respond anonymously
      </div>
    </div>
  );

  return letterContent;
};

export default LetterPreview;
