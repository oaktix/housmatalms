"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  GraduationCap,
  LogOut,
  ClipboardList,
  UserCheck,
  Layers,
  ChevronRight,
  FileCheck2,
  ListTodo,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import Logo from "@/components/Logo";
import { db } from "@/lib/db";

interface LmsLayoutProps {
  children: React.ReactNode;
}

export default function LmsLayout({ children }: LmsLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, loading, logout } = useAuth();
  const [progress, setProgress] = useState(0);
  const [points, setPoints] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on path change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Load progress details if student
  useEffect(() => {
    if (currentUser && currentUser.role === "student") {
      const studentId = currentUser.id;
      const submissions = db.getStudentSubmissions(studentId).filter((s) => s.status === "graded");
      const quizAttempts = db.getQuizAttempts(studentId).filter((q) => q.passed);
      
      const completedUnits = submissions.length + quizAttempts.length;
      const totalUnits = db.getAssignments().length + db.getQuizzes().length;
      
      const percent = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
      setProgress(percent);
      
      // Calculate total points earned from graded submissions
      const totalPoints = submissions.reduce((sum, item) => sum + (item.grade || 0), 0);
      setPoints(totalPoints);
    }
  }, [currentUser, pathname]);

  // Session route protection
  useEffect(() => {
    if (!loading && !currentUser && pathname !== "/lms/login") {
      router.push("/lms/login");
    }
  }, [currentUser, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-main text-text-muted text-xs">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Verifying LMS session...</p>
        </div>
      </div>
    );
  }

  if (pathname === "/lms/login") {
    return <>{children}</>;
  }

  if (!currentUser) {
    return null; // Prevents layout rendering flash before redirect
  }

  const role = currentUser.role;

  // Contextual Navigation links by Role
  const navItems = {
    admin: [
      { name: "Overview Hub", href: "/lms/admin/dashboard", icon: <Layers className="w-4 h-4" /> },
      { name: "User Accounts", href: "/lms/admin/users", icon: <UserCheck className="w-4 h-4" /> },
      { name: "Admissions Review", href: "/lms/admin/applications", icon: <ClipboardList className="w-4 h-4" /> },
      { name: "Cohort Manager", href: "/lms/admin/cohorts", icon: <Users className="w-4 h-4" /> },
      { name: "Graduate Deployments", href: "/lms/admin/students", icon: <ShieldCheck className="w-4 h-4" /> },
    ],
    instructor: [
      { name: "Instructor Hub", href: "/lms/instructor/dashboard", icon: <Layers className="w-4 h-4" /> },
      { name: "Grading Queue", href: "/lms/instructor/grading", icon: <ClipboardList className="w-4 h-4" /> },
      { name: "Attendance Records", href: "/lms/instructor/attendance", icon: <FileCheck2 className="w-4 h-4" /> },
    ],
    student: [
      { name: "Student Dashboard", href: "/lms/student/dashboard", icon: <ListTodo className="w-4 h-4" /> },
      { name: "My Credentials", href: "/lms/student/credentials", icon: <GraduationCap className="w-4 h-4" /> },
    ],
  }[role];

  const handleLogout = () => {
    logout();
    router.push("/lms/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-main text-text-main relative">
      {/* Dimmed backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside className={`fixed inset-y-0 left-0 w-72 border-r border-border-main bg-bg-card glass flex flex-col justify-between flex-shrink-0 z-30 transition-transform duration-300 md:static md:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col flex-grow overflow-y-auto">
          {/* Sidebar Brand Header */}
          <div className="p-6 border-b border-border-main space-y-1 relative">
            <Logo height={24} showText={true} />
            <span className="inline-block text-[9px] font-extrabold text-primary bg-primary-glow border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Verified Operator LMS
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-border-main md:hidden transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Student Profile Card */}
          <div className="p-5 border-b border-border-main space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-heading font-bold text-text-inverse text-base">
                {currentUser.full_name.charAt(0)}
              </div>
              <div className="min-w-0 flex-grow">
                <span className="block text-xs font-bold text-text-main truncate">
                  {currentUser.full_name}
                </span>
                <span className="block text-[10px] text-text-muted capitalize">
                  {role === "student" ? "Candidate Operator" : role}
                </span>
              </div>
            </div>

            {/* If Student, render progress trackers */}
            {role === "student" && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>Course Progress</span>
                  <span className="font-bold text-primary">{progress}%</span>
                </div>
                <div className="w-full bg-border-main h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500 shadow-[0_0_8px_var(--primary)]"
                    ref={(el) => { if (el) el.style.width = `${progress}%`; }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-text-muted pt-1">
                  <span>Earned Points</span>
                  <span className="font-bold text-secondary">{points} Points</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Menu */}
          <nav className="p-4 space-y-1.5 flex-grow">
            <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider block px-3 mb-2">
              Menu Navigation
            </span>
            {navItems.map((item) => {
              const active = (pathname ?? "").startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    active
                      ? "bg-primary-glow text-primary border-l-2 border-primary pl-2.5"
                      : "text-text-muted hover:text-text-main hover:bg-bg-card-hover"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Logout */}
        <div className="p-4 border-t border-border-main bg-bg-main/55">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border border-border-main hover:bg-error/5 hover:text-error hover:border-error/20 text-text-muted transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-grow flex flex-col overflow-hidden h-full min-w-0">
        {/* Workspace Top Header */}
        <header className="h-16 border-b border-border-main px-4 md:px-8 flex items-center justify-between flex-shrink-0 bg-bg-card/45 backdrop-filter backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-text-muted hover:text-text-main md:hidden transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="space-y-0.5">
              <h2 className="text-sm font-heading font-bold text-text-main capitalize">
                {role} Workspace
              </h2>
              <span className="text-[10px] text-text-muted hidden sm:inline-block">
                Housmata Academy Certified Operators Network
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-text-muted">
            <Link
              href="/"
              className="text-[10px] border border-border-main hover:bg-bg-card-hover px-3 py-1.5 rounded-lg transition-colors"
            >
              Public Home
            </Link>
            <span className="text-[10px] py-1 px-3 bg-primary-glow border border-primary/20 text-primary rounded-lg capitalize">
              Role: {role}
            </span>
          </div>
        </header>

        {/* Viewport Render Area */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 bg-bg-main relative">
          {children}
        </div>
      </main>
    </div>
  );
}
