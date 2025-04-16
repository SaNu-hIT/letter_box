import { createClient } from "@supabase/supabase-js";
import { type User } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sign up a new user
export async function signUp(
  email: string,
  password: string,
  name: string = "",
) {
  // First, sign up the user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    throw error;
  }

  // If user was created successfully, also add to the users table
  if (data.user) {
    try {
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          name: name,
          email: email,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error("Error adding user to users table:", insertError);
        // We don't throw here to avoid preventing signup if this fails
      }
    } catch (err) {
      console.error("Error in users table operation:", err);
      // We don't throw here to avoid preventing signup if this fails
    }
  }

  return data;
}

// Sign in a user
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

// Sign in as admin using Supabase RPC
export async function signInAdmin(username: string, password: string) {
  try {
    // First try to authenticate via Supabase RPC
    const { data, error } = await supabase.rpc("verify_admin_credentials", {
      admin_username: username,
      admin_password: password,
    });

    if (error) {
      console.error("Error verifying admin credentials:", error);
      return false;
    }

    if (data === true) {
      // Store admin status in local storage
      localStorage.setItem("isAdmin", "true");
      // Also set a session to maintain admin status across page reloads
      sessionStorage.setItem("adminSession", "true");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error in admin authentication:", error);
    return false;
  }
}

// Check if user is admin
export async function isAdmin() {
  // First check if admin is logged in via hardcoded credentials
  if (localStorage.getItem("isAdmin") === "true") {
    return true;
  }

  // Otherwise check via Supabase RPC
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  const { data, error } = await supabase.rpc("is_admin");

  if (error) {
    console.error("Error checking admin status:", error);
    return false;
  }

  return data;
}

// Sign out a user
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  return true;
}

// Get the current user
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Get the current session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

// Reset password
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw error;
  }

  return true;
}

// Update password
export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw error;
  }

  return true;
}
