"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "./db";
import { Profile } from "./mockData";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize authenticated session state between server cookie and local profile
  const syncSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          const profile = db.getProfile(data.user.id) || data.user;
          setCurrentUser(profile);
          if (typeof window !== "undefined") {
            localStorage.setItem("lms_current_user_id", data.user.id);
          }
          setLoading(false);
          return profile;
        }
      }
    } catch {
      // Offline or network error: fall back to local check below
    }

    // Fallback: check saved local ID
    if (typeof window !== "undefined") {
      const savedUserId = localStorage.getItem("lms_current_user_id");
      if (savedUserId) {
        const profile = db.getProfile(savedUserId);
        if (profile) {
          setCurrentUser(profile);
          setLoading(false);
          return profile;
        }
      }
    }

    setLoading(false);
    return null;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;
    syncSession().then(() => {
      if (!mounted) return;
    });

    const checkLocalAuth = () => {
      const savedUserId = localStorage.getItem("lms_current_user_id");
      if (savedUserId) {
        const profile = db.getProfile(savedUserId);
        if (profile) {
          setCurrentUser((prev) => (prev?.id === profile.id ? prev : profile));
        }
      }
    };

    const unsubscribe = db.subscribe(checkLocalAuth);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [syncSession]);

  const login = async (
    emailOrToken: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const isToken = !password && (emailOrToken.includes("-") || !emailOrToken.includes("@"));
      const payload = isToken
        ? { token: emailOrToken }
        : { email: emailOrToken, password: password || "housmata2024" };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Login failed. Please check your credentials.",
        };
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("lms_current_user_id", data.user.id);
      }

      // Also ensure local mock database has profile populated
      const localProfile = db.getProfile(data.user.id) || data.user;
      setCurrentUser(localProfile);

      return { success: true };
    } catch (err) {
      console.error("[useAuth] Login network error:", err);
      // Fallback for offline local dev mode
      const localProfile = db.getProfileByEmail(emailOrToken);
      if (localProfile) {
        if (typeof window !== "undefined") {
          localStorage.setItem("lms_current_user_id", localProfile.id);
        }
        setCurrentUser(localProfile);
        return { success: true };
      }
      return { success: false, error: "Network error connecting to authentication server." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("[useAuth] Logout error:", err);
    }
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
