import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LetterPreviewProps {
  message?: string;
  letterStyle?: "classic" | "romantic" | "vintage" | "modern";
  recipientName?: string;
}

const LetterPreview = ({
  message = "Dear beloved,\n\nWords cannot express how much you mean to me. Every moment spent with you is a treasure I hold close to my heart.\n\nForever yours,\nAn admirer",
  letterStyle = "classic",
  recipientName = "Dearest One",
}: LetterPreviewProps) => {
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

  const style = letterStyles[letterStyle];

  // Format message with line breaks
  const formattedMessage = message.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < message.split("\n").length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto bg-white p-4">
      <div className="text-sm text-gray-500 mb-2 self-start">Preview</div>

      <Card
        className={cn(
          "w-full h-[450px] overflow-hidden relative border-2 shadow-md transition-all duration-300",
          style.borderColor,
        )}
      >
        {/* Background texture */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full bg-repeat",
            style.texture,
            style.bgBlend,
            style.opacity,
          )}
        />

        <CardContent
          className={cn(
            "relative z-10 p-6 h-full flex flex-col",
            style.bgColor,
            style.fontFamily,
          )}
        >
          <div className="flex-1 flex flex-col">
            <div className="mb-6 text-right">
              <div className="text-xs text-gray-400">To:</div>
              <div className={cn("text-lg", style.textColor)}>
                {recipientName}
              </div>
            </div>

            <div
              className={cn(
                "flex-1 text-sm leading-relaxed overflow-y-auto",
                style.textColor,
              )}
            >
              {formattedMessage}
            </div>

            <div className="mt-6 text-right">
              <div className={cn("italic", style.textColor)}>With love,</div>
              <div className={cn("text-sm mt-1", style.textColor)}>
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

      <div className="mt-4 text-xs text-gray-500 text-center">
        Recipients can scan the QR code to respond anonymously
      </div>
    </div>
  );
};

export default LetterPreview;
