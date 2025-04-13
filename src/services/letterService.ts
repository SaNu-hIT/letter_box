import { supabase } from "./supabaseClient";
import { LetterData } from "../components/LetterCreationForm";

export interface Letter extends LetterData {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new letter in the database
 */
export const createLetter = async (letterData: LetterData): Promise<Letter> => {
  const { data, error } = await supabase
    .from("letters")
    .insert(letterData)
    .select()
    .single();

  if (error) {
    console.error("Error creating letter:", error);
    throw new Error(error.message);
  }

  return data as Letter;
};

/**
 * Get all letters for the current user
 */
export const getLetters = async (): Promise<Letter[]> => {
  const { data, error } = await supabase
    .from("letters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching letters:", error);
    throw new Error(error.message);
  }

  return data as Letter[];
};

/**
 * Get a letter by ID
 */
export const getLetterById = async (id: string): Promise<Letter> => {
  const { data, error } = await supabase
    .from("letters")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching letter:", error);
    throw new Error(error.message);
  }

  return data as Letter;
};

/**
 * Update a letter
 */
export const updateLetter = async (
  id: string,
  updates: Partial<LetterData>,
): Promise<Letter> => {
  const { data, error } = await supabase
    .from("letters")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating letter:", error);
    throw new Error(error.message);
  }

  return data as Letter;
};

/**
 * Delete a letter
 */
export const deleteLetter = async (id: string): Promise<void> => {
  const { error } = await supabase.from("letters").delete().eq("id", id);

  if (error) {
    console.error("Error deleting letter:", error);
    throw new Error(error.message);
  }
};
