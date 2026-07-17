"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, Calendar, Award, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import Logo from "./Logo";
import { db } from "@/lib/db";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    const progress = db.getProgress(currentUser.id);
    if (progress) {
      setCourseTitle(
        progress.course_id === "property-advisor-hcpa"
          ? "Certified Property Advisor (HCPA)"
          : "Certified Estate Manager (HCEM)"
      );
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-main text-text-muted text-xs">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-heading font-medium tracking-tight">Verifying Student Portal...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { name: "Overview Hub", href: "/lms/student/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Curriculum Path", href: "/lms/student/curriculum", icon: <BookOpen className="w-4 h-4" /> },
    { name: "Meetings & Live", href: "/lms/student/meetings", icon: <Calendar className="w-4 h-4" /> },
    { name: "Grades & Feedback", href: "/lms/student/grades", icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-bg-main text-text-main flex flex-col font-sans">
      {/* Premium Student Top Navigation Header */}
      <header className="bg-bg-card/85 backdrop-blur-md border-b border-border-main/60 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo height={28} />
            <span className="h-4 w-px bg-border-main/80 hidden sm:inline" />
            <span className="text-[10px] uppercase tracking-widest font-black text-primary hidden sm:inline">
              {courseTitle || "Student Portal"}
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "bg-primary text-text-inverse shadow-md shadow-primary-glow"
                      : "text-text-muted hover:text-text-main hover:bg-bg-card-hover"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Student Account Menu & Logout */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-extrabold text-text-main">{currentUser.full_name}</div>
              <div className="text-[9px] font-bold text-text-muted">{courseTitle}</div>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/lms");
              }}
              className="p-2.5 rounded-xl border border-border-main hover:border-error/30 hover:text-error hover:bg-error/5 text-text-muted transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl border border-border-main text-text-main hover:bg-bg-card-hover transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-main/50 mt-4 bg-bg-card animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              <div className="pb-3 border-b border-border-main/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-text-main">{currentUser.full_name}</div>
                  <div className="text-[9px] font-bold text-text-muted">{courseTitle}</div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-primary bg-primary-glow px-2.5 py-0.5 rounded border border-primary/20">
                  LMS Student
                </span>
              </div>
              <nav className="flex flex-col gap-1.5">
                {navLinks.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? "bg-primary text-text-inverse shadow-sm"
                          : "text-text-muted hover:text-text-main hover:bg-bg-card-hover"
                      }`}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="pt-2 border-t border-border-main/40">
                <button
                  onClick={() => {
                    logout();
                    router.push("/lms");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-error/5 hover:bg-error/10 border border-error/20 text-error text-xs font-bold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Session
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 relative z-10 flex flex-col gap-8">
        {children}
      </main>
    </div>
  );
}
