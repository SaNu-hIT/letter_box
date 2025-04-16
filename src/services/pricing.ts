import { supabase } from "./auth";

export interface PricingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_popular?: boolean;
  sort_order?: number;
}

// Fetch all pricing options from the database
export async function getPricingOptions() {
  const { data, error } = await supabase
    .from("pricing_options")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching pricing options:", error);
    throw error;
  }

  // Transform the data to match the frontend schema if needed
  const transformedData: PricingOption[] = data.map((option) => ({
    id: option.id,
    name: option.name,
    description: option.description,
    price: option.price,
    features: option.features || [],
    is_popular: option.is_popular,
    sort_order: option.sort_order,
  }));

  return transformedData;
}

// Fallback pricing options to use when database fetch fails
export const fallbackPricingOptions: PricingOption[] = [
  {
    id: "standard",
    name: "Standard",
    description: "For the patient romantic",
    price: 799, // ₹799
    features: [
      "Premium paper",
      "Standard delivery (5-7 days)",
      "QR code for reply",
    ],
    is_popular: false,
    sort_order: 1,
  },
  {
    id: "premium",
    name: "Premium",
    description: "For the passionate heart",
    price: 1199, // ₹1,199
    features: [
      "Luxury paper with scent",
      "Express delivery (2-3 days)",
      "QR code for reply",
      "Wax seal with rose petals",
    ],
    is_popular: true,
    sort_order: 2,
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "For the ultimate romantic",
    price: 1999, // ₹1,999
    features: [
      "Handmade artisan paper",
      "Priority delivery (1-2 days)",
      "QR code for reply",
      "Custom wax seal & gift box",
    ],
    is_popular: false,
    sort_order: 3,
  },
];
