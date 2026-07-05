"use client";

import { useState, useEffect } from "react";
import { db } from "./db";
import { Profile } from "./mockData";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Keep a ref to the last-set profile ID so we don't call setCurrentUser
    // (and cause a cascade of re-renders) when the data hasn't actually changed.
    let lastSetUserId: string | null = null;

    const checkAuth = () => {
      const savedUserId = localStorage.getItem("lms_current_user_id");
      if (savedUserId) {
        const profile = db.getProfile(savedUserId);
        if (profile) {
          // Only update React state if the profile actually changed,
          // not on every db.notify() call which creates a new object ref.
          if (profile.id !== lastSetUserId) {
            lastSetUserId = profile.id;
            setCurrentUser(profile);
          }
          setLoading(false);
        } else {
          // Profile not found in cache yet — could mean sync is still in
          // progress. Only clear the session if profiles have fully loaded
          // AND we still can't find this user.
          const allProfiles = db.getProfiles();
          if (allProfiles.length > 0) {
            lastSetUserId = null;
            localStorage.removeItem("lms_current_user_id");
            setCurrentUser(null);
            setLoading(false);
          }
          // Otherwise keep loading=true and wait for the next notify()
        }
      } else {
        lastSetUserId = null;
        setLoading(false);
      }
    };

    checkAuth();
    
    // Subscribe to database updates (like Supabase sync completing)
    const unsubscribe = db.subscribe(checkAuth);

    // Safety timeout to ensure loading screen closes even on slow network
    const timer = setTimeout(() => {
      const savedUserId = localStorage.getItem("lms_current_user_id");
      // Only force-disable loading if there is no session to verify,
      // or if the profiles are loaded and we can do a proper check.
      if (!savedUserId || db.getProfiles().length > 0) {
        setLoading(false);
      }
    }, 8000);

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
