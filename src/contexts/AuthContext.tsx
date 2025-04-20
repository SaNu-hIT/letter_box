import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import {
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  isAdmin as checkIsAdmin,
} from "../services/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a function component for the hook to make it compatible with Fast Refresh
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for user on initial load
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Check for admin status from session storage first
        if (
          sessionStorage.getItem("adminSession") === "true" ||
          localStorage.getItem("isAdmin") === "true"
        ) {
          setIsAdmin(true);
        } else if (currentUser) {
          const adminStatus = await checkIsAdmin();
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Auth functions
  const handleSignIn = async (email: string, password: string) => {
    try {
      const { user } = await signIn(email, password);
      setUser(user);

      if (user) {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      }

      return user;
    } catch (error) {
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      const { user } = await signUp(email, password);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAdmin(false);
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    isAdmin,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { useAuth, AuthProvider };
