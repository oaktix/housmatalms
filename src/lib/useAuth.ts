"use client";

import { useState, useEffect } from "react";
import { db } from "./db";
import { Profile } from "./mockData";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAuth = () => {
      if (db.isSyncing()) {
        setLoading(true);
        return;
      }

      const savedUserId = localStorage.getItem("lms_current_user_id");
      if (savedUserId) {
        const profile = db.getProfile(savedUserId);
        if (profile) {
          setCurrentUser(profile);
          setLoading(false);
        } else {
          // Only clear if the database has finished syncing (i.e. has profiles)
          const allProfiles = db.getProfiles();
          if (allProfiles.length > 0) {
            localStorage.removeItem("lms_current_user_id");
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Subscribe to database updates (like Supabase sync completing)
    const unsubscribe = db.subscribe(checkAuth);

    // Safety timeout to ensure loading screen closes even on slow network
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const login = (email: string): { success: boolean; error?: string } => {
    const profile = db.getProfileByEmail(email);
    if (!profile) {
      return { success: false, error: "No account found for this email. Applications must be approved by an administrator before you can access the LMS." };
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("lms_current_user_id", profile.id);
    }
    setCurrentUser(profile);
    return { success: true };
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lms_current_user_id");
    }
    setCurrentUser(null);
  };

  return {
    currentUser,
    loading,
    login,
    logout,
    isAdmin: currentUser?.role === "admin",
    isInstructor: currentUser?.role === "instructor",
    isStudent: currentUser?.role === "student",
  };
}
