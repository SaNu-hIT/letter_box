import { supabase } from "./auth";

export interface PricingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_popular?: boolean;
  sort_order?: number;
  delivery_speed?: string;
  delivery_days?: string;
}

// Fetch all pricing options from the database
export async function getPricingOptions() {
  try {
    const { data, error } = await supabase
      .from("pricing_options")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data.map((option) => ({
      id: option.id,
      name: option.name,
      description: option.description,
      price: option.price,
      features: option.features || [],
      is_popular: option.is_popular,
      sort_order: option.sort_order,
      delivery_speed: option.delivery_speed,
      delivery_days: option.delivery_days,
    }));
  } catch (error) {
    console.error("Error fetching pricing options:", error);
    throw error;
  }
}

// Create a new pricing option
export async function createPricingOption(option: PricingOption) {
  try {
    // Ensure features is an array
    const features = Array.isArray(option.features) ? option.features : [];

    const { data, error } = await supabase
      .from("pricing_options")
      .insert([
        {
          name: option.name,
          description: option.description,
          price: option.price,
          features: features,
          is_popular: option.is_popular || false,
          sort_order: option.sort_order || 0,
          delivery_speed: option.delivery_speed || "standard",
          delivery_days: option.delivery_days || "",
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error creating pricing option:", error);
    throw error;
  }
}

// Update an existing pricing option
export async function updatePricingOption(id: string, option: PricingOption) {
  try {
    // Ensure features is an array
    const features = Array.isArray(option.features) ? option.features : [];

    const { data, error } = await supabase
      .from("pricing_options")
      .update({
        name: option.name,
        description: option.description,
        price: option.price,
        features: features,
        is_popular: option.is_popular || false,
        sort_order: option.sort_order || 0,
        delivery_speed: option.delivery_speed || "standard",
        delivery_days: option.delivery_days || "",
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error updating pricing option:", error);
    throw error;
  }
}

// Delete a pricing option
export async function deletePricingOption(id: string) {
  try {
    const { error } = await supabase
      .from("pricing_options")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting pricing option:", error);
    throw error;
  }
}

// Fallback pricing options to use when database fetch fails
export const fallbackPricingOptions: PricingOption[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Standard",
    description: "For the patient romantic",
    price: 799, // ₹799
    features: ["Premium paper", "QR code for reply"],
    is_popular: false,
    sort_order: 1,
    delivery_speed: "standard",
    delivery_days: "5-7 days",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Premium",
    description: "For the passionate heart",
    price: 1199, // ₹1,199
    features: [
      "Luxury paper with scent",
      "QR code for reply",
      "Wax seal with rose petals",
    ],
    is_popular: true,
    sort_order: 2,
    delivery_speed: "express",
    delivery_days: "2-3 days",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Luxury",
    description: "For the ultimate romantic",
    price: 1999, // ₹1,999
    features: [
      "Handmade artisan paper",
      "QR code for reply",
      "Custom wax seal & gift box",
    ],
    is_popular: false,
    sort_order: 3,
    delivery_speed: "overnight",
    delivery_days: "1-2 days",
  },
];
