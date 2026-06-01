"use client";

import { useState, useEffect } from "react";
import { db } from "./db";
import { Profile } from "./mockData";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUserId = localStorage.getItem("lms_current_user_id");
      if (savedUserId) {
        const profile = db.getProfile(savedUserId);
        if (profile) {
          setCurrentUser(profile);
        } else {
          localStorage.removeItem("lms_current_user_id");
        }
      }
      setLoading(false);
    }
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
