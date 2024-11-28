"use client";

import { createContext, useContext, useEffect, useState } from "react";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "@/firebase/auth.ts";

interface AuthProviderProps {
  children: React.ReactNode;
}

// Define types for AuthContext
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  handleGoogleLogin: () => Promise<void>;
  handleLogOut: () => Promise<void>;
}

//  create auth context

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthContextProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //   handle google login

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      // Specify error type as unknown
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);

    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unSub();
    };
  }, []);

  //   handle log out

  const handleLogOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error: unknown) {
      // Specify error type as unknown
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred during logout.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        handleGoogleLogin,
        handleLogOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// export auth context

// Export auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
