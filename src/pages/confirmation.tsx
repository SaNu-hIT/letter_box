import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Truck,
  QrCode,
  ArrowRight,
  Home,
  Send,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface ConfirmationProps {
  orderNumber?: string;
  recipientName?: string;
  estimatedDelivery?: string;
  qrCodeUrl?: string;
}

export default function Confirmation({
  orderNumber = "LV-12345",
  recipientName = "Sarah Johnson",
  estimatedDelivery = "May 15, 2023",
  qrCodeUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=confirmation",
}: ConfirmationProps) {
  const location = useLocation();
  const letterData = location.state?.letterData;

  // Use data from location state if available
  const displayRecipientName = letterData?.recipientName || recipientName;
  const displayOrderNumber = letterData?.id
    ? `LV-${letterData.id.substring(0, 5)}`
    : orderNumber;

  // Calculate estimated delivery based on delivery speed
  const getEstimatedDelivery = () => {
    if (!letterData) return estimatedDelivery;

    const today = new Date();
    let deliveryDate = new Date(today);

    switch (letterData.deliverySpeed) {
      case "overnight":
        deliveryDate.setDate(today.getDate() + 1);
        break;
      case "express":
        deliveryDate.setDate(today.getDate() + 3);
        break;
      default: // standard
        deliveryDate.setDate(today.getDate() + 7);
    }

    return deliveryDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex flex-col items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <Card className="border-pink-200 shadow-lg bg-white">
          <CardHeader className="text-center border-b border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto mb-4"
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </motion.div>
            <CardTitle className="text-2xl md:text-3xl font-serif text-purple-900">
              Order Confirmed!
            </CardTitle>
            <CardDescription className="text-purple-700 mt-2">
              Your anonymous love letter is on its way to being created and
              delivered.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 pb-4 px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Order Number
                  </h3>
                  <p className="text-lg font-medium text-purple-800">
                    {displayOrderNumber}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Recipient
                  </h3>
                  <p className="text-lg font-medium text-purple-800">
                    {displayRecipientName}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Estimated Delivery
                  </h3>
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 text-pink-600 mr-2" />
                    <p className="text-lg font-medium text-purple-800">
                      {getEstimatedDelivery()}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Delivery Status
                  </h3>
                  <div className="relative">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-pink-100">
                      <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500 w-1/4"></div>
                    </div>
                    <div className="flex justify-between text-xs text-pink-600 mt-1">
                      <span>Processing</span>
                      <span>Printing</span>
                      <span>Shipping</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-pink-100 rounded-lg p-4 bg-pink-50 flex flex-col items-center justify-center">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  QR Code for Recipient Reply
                </h3>
                <div className="bg-white p-2 rounded-lg shadow-md mb-3">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code for reply"
                    className="h-32 w-32"
                  />
                </div>
                <p className="text-xs text-center text-gray-500 max-w-xs">
                  This QR code will be printed on the letter. When scanned, it
                  allows the recipient to reply anonymously.
                </p>
              </div>
            </div>

            <Separator className="my-6 bg-pink-100" />

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <h3 className="font-medium text-purple-800 mb-2 flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                What happens next?
              </h3>
              <ul className="text-sm text-purple-700 space-y-2">
                <li className="flex items-start">
                  <ArrowRight className="h-4 w-4 text-pink-500 mr-2 mt-0.5 flex-shrink-0" />
                  We'll carefully print your letter on premium paper with your
                  selected design.
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-4 w-4 text-pink-500 mr-2 mt-0.5 flex-shrink-0" />
                  The letter will be sealed and mailed to your recipient with no
                  return address.
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-4 w-4 text-pink-500 mr-2 mt-0.5 flex-shrink-0" />
                  When they receive it, they can scan the QR code to send an
                  anonymous reply.
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-4 w-4 text-pink-500 mr-2 mt-0.5 flex-shrink-0" />
                  You'll be notified when they reply (if they choose to).
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50 p-4 md:p-6">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-pink-300 text-pink-700 hover:bg-pink-100"
              asChild
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </Link>
            </Button>

            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
              asChild
            >
              <Link to="/create">
                <Send className="h-4 w-4 mr-2" />
                Send Another Letter
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
