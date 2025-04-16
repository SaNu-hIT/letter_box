import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Heart, CheckCircle, Loader2 } from "lucide-react";
import {
  getPricingOptions,
  fallbackPricingOptions,
  PricingOption,
} from "@/services/pricing";
import { useToast } from "./ui/use-toast";

interface PricingSectionProps {
  showTitle?: boolean;
  className?: string;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  showTitle = true,
  className = "",
}) => {
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>(
    fallbackPricingOptions,
  );
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPricingOptions = async () => {
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
        }
      } catch (error) {
        console.error("Error fetching pricing options:", error);
        // Use fallback pricing options (already set as default)
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

    fetchPricingOptions();
  }, [toast]);

  // Format price in INR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section
      className={`py-16 bg-gradient-to-b from-purple-50 to-pink-50 ${className}`}
    >
      <div className="container mx-auto px-4">
        {showTitle && (
          <>
            <h2 className="text-3xl font-serif text-center text-pink-800 mb-4">
              Choose Your Package
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Select the perfect package for your love letter. All packages
              include anonymous delivery and QR code for replies.
            </p>
          </>
        )}

        {isLoadingPricing ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
            <span className="ml-2 text-pink-700">
              Loading pricing options...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card
                  className={`${option.is_popular ? "border-purple-300 shadow-lg" : "border-pink-200 hover:shadow-lg"} transition-shadow duration-300 overflow-hidden relative`}
                >
                  {option.is_popular && (
                    <div className="absolute top-0 right-0">
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white m-2">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <div
                    className={`${option.is_popular ? "bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200" : "bg-gradient-to-r from-pink-100 to-pink-50 border-b border-pink-200"} px-6 py-4`}
                  >
                    <h3
                      className={`text-xl font-serif ${option.is_popular ? "text-purple-800" : "text-pink-800"}`}
                    >
                      {option.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-800">
                        {formatPrice(option.price)}
                      </span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {option.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {option.delivery_days && (
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>
                            {option.delivery_speed === "standard"
                              ? "Standard"
                              : option.delivery_speed === "express"
                                ? "Express"
                                : "Priority"}{" "}
                            delivery{" "}
                            {option.delivery_days &&
                              `(${option.delivery_days})`}
                          </span>
                        </li>
                      )}
                    </ul>
                    <Button
                      className={`w-full ${option.is_popular ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600" : "bg-pink-500 hover:bg-pink-600"} text-white`}
                      asChild
                    >
                      <Link to={`/create?package=${option.id}`}>
                        <Heart className="mr-2 h-4 w-4" /> Choose{" "}
                        {option.name || "Package"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection;
