import { createClient } from "@supabase/supabase-js";
import { type User } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Address interface for user addresses
export interface UserAddress {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default?: boolean;
}

// Sign up a new user
export async function signUp(
  email: string,
  password: string,
  name: string = "",
  address?: UserAddress,
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

      // If address information is provided, save it to the addresses table
      if (address) {
        // Ensure all required fields are present
        if (
          address.address &&
          address.city &&
          address.state &&
          address.zip &&
          address.country
        ) {
          const { error: addressError } = await supabase
            .from("addresses")
            .insert([
              {
                user_id: data.user.id,
                address: address.address,
                city: address.city,
                state: address.state,
                zip: address.zip,
                country: address.country,
                is_default:
                  address.is_default !== undefined ? address.is_default : true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ]);

          if (addressError) {
            console.error("Error adding user address:", addressError);
            // We don't throw here to avoid preventing signup if this fails
          }
        } else {
          console.warn(
            "Incomplete address information provided, skipping address save",
          );
        }
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

// Sign in as admin using Supabase admin_credentials table
export async function signInAdmin(username: string, password: string) {
  try {
    // Query the admin_credentials table to check if the provided credentials match
    const { data, error } = await supabase
      .from("admin_credentials")
      .select("username, password_hash")
      .eq("username", username)
      .single();

    if (error) {
      console.error("Error fetching admin credentials:", error);
      return false;
    }

    // Check if credentials match
    if (data && data.password_hash === password) {
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

// Get user addresses
export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user addresses:", error);
    return [];
  }

  return data || [];
}

// Add a new address for a user
export async function addUserAddress(userId: string, address: UserAddress) {
  const { data, error } = await supabase
    .from("addresses")
    .insert([
      {
        user_id: userId,
        address: address.address,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
        is_default:
          address.is_default !== undefined ? address.is_default : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    throw error;
  }

  return data[0];
}

// Update an existing address
export async function updateUserAddress(
  addressId: string,
  address: Partial<UserAddress>,
) {
  const { data, error } = await supabase
    .from("addresses")
    .update({
      ...address,
      updated_at: new Date().toISOString(),
    })
    .eq("id", addressId)
    .select();

  if (error) {
    throw error;
  }

  return data[0];
}

// Delete an address
export async function deleteUserAddress(addressId: string) {
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId);

  if (error) {
    throw error;
  }

  return true;
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
