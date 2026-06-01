"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function LmsGateway() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push("/lms/login");
      } else {
        const role = currentUser.role;
        if (role === "admin") {
          router.push("/lms/admin/dashboard");
        } else if (role === "instructor") {
          router.push("/lms/instructor/dashboard");
        } else if (role === "student") {
          router.push("/lms/student/dashboard");
        } else {
          router.push("/lms/login");
        }
      }
    }
  }, [currentUser, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-main text-text-muted text-xs">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Loading Housmata LMS session...</p>
      </div>
    </div>
  );
}
