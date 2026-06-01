"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, LogIn, Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/lib/useAuth";

export default function LmsLogin() {
  const router = useRouter();
  const { login, currentUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      router.push("/lms");
    }
  }, [currentUser, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter your email address and password.");
      setLoading(false);
      return;
    }

    // Simple password validation — all seed accounts use password "housmata2024"
    // In production this would verify against Supabase Auth
    const DEMO_PASSWORD = "housmata2024";
    if (password !== DEMO_PASSWORD) {
      setError("Incorrect password. Please try again.");
      setLoading(false);
      return;
    }

    const res = login(email);
    setLoading(false);
    if (res.success) {
      router.push("/lms");
    } else {
      setError(res.error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-main text-text-main font-sans justify-between relative">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(38,196,150,0.06),transparent_40%)]" />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border-main relative z-10">
        <Link href="/">
          <Logo height={28} />
        </Link>
        <Link href="/" className="text-xs font-semibold text-text-muted hover:text-text-main">
          ← Back to Public Website
        </Link>
      </header>

      {/* Main card */}
      <main className="flex items-center justify-center p-6 relative z-10 flex-grow">
        <div className="w-full max-w-md premium-card rounded-2xl bg-bg-card border-border-main p-8 space-y-6 shadow-md">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-primary-glow border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-text-main">LMS Private Portal</h1>
            <p className="text-text-muted text-xs">
              Access your courses, cohorts, and certification records.<br />
              Approved students, instructors, and administrators only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-error/10 border border-error/20 text-error text-xs font-semibold rounded-lg flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="text-xs font-extrabold text-text-muted mb-1 block">
                Registered Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="e.g. yourname@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="text-xs font-extrabold text-text-muted mb-1 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn bg-primary text-text-inverse hover:brightness-110 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="border-t border-border-main pt-4 text-center space-y-2">
            <p className="text-[10px] text-text-muted leading-relaxed">
              Don&apos;t have an account?{" "}
              <Link href="/apply" className="text-primary hover:underline font-semibold">
                Apply for admission
              </Link>
              . Your login credentials will be shared once your application is approved by an administrator.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-[10px] text-text-muted relative z-10 border-t border-border-main">
        <span>© {new Date().getFullYear()} Housmata Technologies Ltd. Powered by Property Max Results Ltd.</span>
      </footer>
    </div>
  );
}
