"use client";

import { useState, useEffect } from "react";
import { db } from "./db";
import { Profile } from "./mockData";

export function useAuth() {
  const [state, setState] = useState<{ currentUser: Profile | null; loading: boolean }>({
    currentUser: null,
    loading: true
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAuth = () => {
      if (db.isSyncing()) {
        setState(prev => prev.loading ? prev : { ...prev, loading: true });
        return;
      }

      const savedUserId = localStorage.getItem("lms_current_user_id");
      if (savedUserId) {
        const profile = db.getProfile(savedUserId);
        if (profile) {
          setState({ currentUser: profile, loading: false });
        } else {
          // Only clear if the database has finished syncing (i.e. has profiles)
          const allProfiles = db.getProfiles();
          if (allProfiles.length > 0) {
            localStorage.removeItem("lms_current_user_id");
            setState({ currentUser: null, loading: false });
          }
        }
      } else {
        setState({ currentUser: null, loading: false });
      }
    };

    checkAuth();
    
    // Subscribe to database updates (like Supabase sync completing)
    const unsubscribe = db.subscribe(checkAuth);

    // Safety timeout to ensure loading screen closes even on slow network
    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, loading: false }));
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
    setState({ currentUser: profile, loading: false });
    return { success: true };
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lms_current_user_id");
    }
    setState({ currentUser: null, loading: false });
  };

  return {
    currentUser: state.currentUser,
    loading: state.loading,
    login,
    logout,
    isAdmin: state.currentUser?.role === "admin",
    isInstructor: state.currentUser?.role === "instructor",
    isStudent: state.currentUser?.role === "student",
  };
}
