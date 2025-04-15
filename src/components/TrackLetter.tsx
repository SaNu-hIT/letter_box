import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Package, Truck, CheckCircle, Clock } from "lucide-react";

interface TrackingStatus {
  status: "processing" | "shipped" | "delivered" | "replied" | "not_found";
  date?: string;
  details?: string;
}

const TrackLetter = () => {
  const [trackingCode, setTrackingCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<TrackingStatus | null>(
    null,
  );

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setIsLoading(true);

    // TODO: Replace with actual API call to track letter
    // This is a mock implementation for now
    setTimeout(() => {
      // Mock response based on tracking code format
      if (trackingCode.startsWith("LL")) {
        setTrackingResult({
          status: "delivered",
          date: "May 15, 2023",
          details: "Your letter was delivered to the recipient.",
        });
      } else if (trackingCode.startsWith("LP")) {
        setTrackingResult({
          status: "processing",
          date: "May 12, 2023",
          details: "Your letter is being prepared for delivery.",
        });
      } else if (trackingCode.startsWith("LS")) {
        setTrackingResult({
          status: "shipped",
          date: "May 13, 2023",
          details: "Your letter is on its way to the recipient.",
        });
      } else if (trackingCode.startsWith("LR")) {
        setTrackingResult({
          status: "replied",
          date: "May 18, 2023",
          details: "The recipient has replied to your letter!",
        });
      } else {
        setTrackingResult({
          status: "not_found",
          details: "No letter found with this tracking code.",
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Package className="h-8 w-8 text-purple-500" />;
      case "shipped":
        return <Truck className="h-8 w-8 text-blue-500" />;
      case "delivered":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "replied":
        return <CheckCircle className="h-8 w-8 text-rose-500" />;
      default:
        return <Clock className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-12 flex flex-col items-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
            Track Your <span className="text-rose-500">Letter</span>
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Enter your tracking code to see the status of your love letter.
          </p>

          <Card className="shadow-lg border-none bg-white">
            <CardContent className="pt-6">
              <form onSubmit={handleTrack} className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter tracking code (e.g., LL12345)"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="flex-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    {isLoading ? (
                      "Tracking..."
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" /> Track
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {isLoading && (
                <div className="flex justify-center my-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
              )}

              {trackingResult && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8"
                >
                  {trackingResult.status === "not_found" ? (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Letter Not Found
                      </h3>
                      <p className="text-gray-600">{trackingResult.details}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-center space-x-4 p-4">
                        <div
                          className={`w-3 h-3 rounded-full ${trackingResult.status === "processing" ? "bg-purple-500" : "bg-gray-300"}`}
                        ></div>
                        <div className="h-0.5 w-12 bg-gray-200"></div>
                        <div
                          className={`w-3 h-3 rounded-full ${trackingResult.status === "shipped" ? "bg-blue-500" : trackingResult.status === "delivered" || trackingResult.status === "replied" ? "bg-gray-300" : "bg-gray-300"}`}
                        ></div>
                        <div className="h-0.5 w-12 bg-gray-200"></div>
                        <div
                          className={`w-3 h-3 rounded-full ${trackingResult.status === "delivered" ? "bg-green-500" : trackingResult.status === "replied" ? "bg-gray-300" : "bg-gray-300"}`}
                        ></div>
                        <div className="h-0.5 w-12 bg-gray-200"></div>
                        <div
                          className={`w-3 h-3 rounded-full ${trackingResult.status === "replied" ? "bg-rose-500" : "bg-gray-300"}`}
                        ></div>
                      </div>

                      <div className="flex items-center p-6 bg-gray-50 rounded-lg">
                        <div className="mr-4">
                          {getStatusIcon(trackingResult.status)}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 capitalize">
                            {trackingResult.status === "processing"
                              ? "Processing"
                              : trackingResult.status === "shipped"
                                ? "Shipped"
                                : trackingResult.status === "delivered"
                                  ? "Delivered"
                                  : "Replied"}
                          </h3>
                          {trackingResult.date && (
                            <p className="text-gray-500 text-sm">
                              {trackingResult.date}
                            </p>
                          )}
                          <p className="text-gray-600 mt-1">
                            {trackingResult.details}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              <div className="mt-8 text-center text-sm text-gray-500">
                <p>
                  Can't find your tracking code? Check your order confirmation
                  email or contact our support team.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TrackLetter;
