import { supabase } from "./auth";
import { LetterData } from "@/components/LetterCreationForm";

// Letter status types
export type LetterStatus = "pending" | "printed" | "sent" | "delivered";

// Save a letter to Supabase
export async function saveLetter(letterData: LetterData) {
  // Transform the data to match the database schema
  const transformedData = {
    message: letterData.message,
    style: letterData.style,
    recipient_name: letterData.recipientName,
    recipient_address: letterData.recipientAddress,
    delivery_speed: letterData.deliverySpeed,
    status: letterData.status || "pending",
    is_draft: letterData.isDraft === true, // Ensure boolean value
    user_id: letterData.userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log("Saving letter with data:", transformedData);

  // Check if user_id is present
  if (!transformedData.user_id) {
    console.error("No user_id provided for letter");
    throw new Error("User ID is required to save a letter");
  }

  const { data, error } = await supabase
    .from("letters")
    .insert([transformedData])
    .select();

  if (error) {
    console.error("Error saving letter:", error);
    throw error;
  }

  console.log("Letter saved successfully:", data[0]);
  return data[0];
}

// Get all letters for a user
export async function getUserLetters(userId: string) {
  const { data, error } = await supabase
    .from("letters")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching letters:", error);
    throw error;
  }

  // Transform the data to match the frontend schema
  const transformedData = data.map((letter) => ({
    id: letter.id,
    message: letter.message,
    style: letter.style,
    recipientName: letter.recipient_name,
    recipientAddress: letter.recipient_address,
    deliverySpeed: letter.delivery_speed,
    status: letter.status,
    isDraft: letter.is_draft,
    userId: letter.user_id,
    createdAt: letter.created_at,
    updatedAt: letter.updated_at,
  }));

  return transformedData;
}

// Delete a letter
export async function deleteLetter(id: string) {
  const { error } = await supabase.from("letters").delete().eq("id", id);

  if (error) {
    console.error("Error deleting letter:", error);
    throw error;
  }

  return true;
}

// Update a letter
export async function updateLetter(
  id: string,
  letterData: Partial<LetterData>,
) {
  // Transform the data to match the database schema
  const transformedData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  // Only add fields that are present in letterData
  if (letterData.message !== undefined)
    transformedData.message = letterData.message;
  if (letterData.style !== undefined) transformedData.style = letterData.style;
  if (letterData.recipientName !== undefined)
    transformedData.recipient_name = letterData.recipientName;
  if (letterData.recipientAddress !== undefined)
    transformedData.recipient_address = letterData.recipientAddress;
  if (letterData.deliverySpeed !== undefined)
    transformedData.delivery_speed = letterData.deliverySpeed;
  if (letterData.status !== undefined)
    transformedData.status = letterData.status;
  if (letterData.isDraft !== undefined)
    transformedData.is_draft = letterData.isDraft;

  console.log("Updating letter with data:", transformedData);

  const { data, error } = await supabase
    .from("letters")
    .update(transformedData)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating letter:", error);
    throw error;
  }

  console.log("Letter updated successfully:", data[0]);
  return data[0];
}

// Admin Functions

// Get all letters (admin only)
export async function getAllLetters() {
  const { data, error } = await supabase
    .from("letters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all letters:", error);
    throw error;
  }

  return data;
}

// Get letters by status (admin only)
export async function getLettersByStatus(status: LetterStatus) {
  const { data, error } = await supabase
    .from("letters")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching ${status} letters:`, error);
    throw error;
  }

  return data;
}

// Update letter status (admin only)
export async function updateLetterStatus(id: string, status: LetterStatus) {
  const { data, error } = await supabase
    .from("letters")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating letter status:", error);
    throw error;
  }

  return data[0];
}

// Get letter metrics (admin only)
export async function getLetterMetrics() {
  const { data, error } = await supabase.from("letters").select("status");

  if (error) {
    console.error("Error fetching letter metrics:", error);
    throw error;
  }

  // Calculate counts by status
  const totalCount = data.length;
  const pendingCount = data.filter(
    (letter) => letter.status === "pending",
  ).length;
  const printedCount = data.filter(
    (letter) => letter.status === "printed",
  ).length;
  const sentCount = data.filter((letter) => letter.status === "sent").length;
  const deliveredCount = data.filter(
    (letter) => letter.status === "delivered",
  ).length;

  return {
    total: totalCount,
    pending: pendingCount,
    printed: printedCount,
    sent: sentCount,
    delivered: deliveredCount,
  };
}
