"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Layers,
  GraduationCap,
  ClipboardList,
  FileText,
  Mail,
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Application, EmailLog } from "@/lib/mockData";

export default function AdminDashboard() {
  const { currentUser } = useAuth();

  // Data States
  const [appsCount, setAppsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [instructorsCount, setInstructorsCount] = useState(0);
  const [cohortsCount, setCohortsCount] = useState(0);
  const [certsCount, setCertsCount] = useState(0);
  
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  const loadAdminDashboardData = () => {
    // Metrics
    const allApps = db.getApplications();
    setAppsCount(allApps.length);
    
    const allProfiles = db.getProfiles();
    setStudentsCount(allProfiles.filter((p) => p.role === "student").length);
    setInstructorsCount(allProfiles.filter((p) => p.role === "instructor").length);
    
    setCohortsCount(db.getCohorts().length);
    setCertsCount(db.getCertificates().length);

    // Recent 5 Pending Applications
    setRecentApps(allApps.filter((a) => a.status === "pending").slice(0, 5));

    // Email logs
    setEmailLogs(db.getEmailLogs().slice(-6).reverse()); // Show last 6 logs
  };

  useEffect(() => {
    loadAdminDashboardData();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-glow text-primary">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase">Applications</span>
            <span className="text-xl font-heading font-black text-text-main">{appsCount}</span>
          </div>
        </div>

        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-glow text-primary">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase">Trainees</span>
            <span className="text-xl font-heading font-black text-text-main">{studentsCount}</span>
          </div>
        </div>

        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-glow text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase">Instructors</span>
            <span className="text-xl font-heading font-black text-text-main">{instructorsCount}</span>
          </div>
        </div>

        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-glow text-primary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase">Cohorts</span>
            <span className="text-xl font-heading font-black text-text-main">{cohortsCount}</span>
          </div>
        </div>

        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent-glow text-accent">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase">Certificates</span>
            <span className="text-xl font-heading font-black text-text-main">{certsCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recent applications list (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-main pb-3">
              <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Pending Admission Applications
              </h3>
              <Link
                href="/lms/admin/applications"
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                Review Panel
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentApps.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-grid text-xs">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>State</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApps.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <div className="font-bold text-text-main">{a.applicant_name}</div>
                          <div className="text-[10px] text-text-muted">{a.email}</div>
                        </td>
                        <td>{a.state}</td>
                        <td>
                          <Link
                            href="/lms/admin/applications"
                            className="text-[10px] text-primary hover:underline font-bold"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-text-muted italic py-4 text-center">No pending applications in queue.</p>
            )}
          </div>

          {/* Simple Course Completion Analytics */}
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4">
            <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 border-b border-border-main pb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              Curriculum Engagement Analytics
            </h3>
            
            <div className="space-y-3.5 text-xs text-text-muted">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-text-main">Phase 1 Foundations Completes</span>
                  <span className="text-primary font-bold">84%</span>
                </div>
                <div className="w-full bg-border-main h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full w-[84%]" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-text-main">Phase 2 Sandbox Execution Rate</span>
                  <span className="text-primary font-bold">68%</span>
                </div>
                <div className="w-full bg-border-main h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full w-[68%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AWS SES SMTP email logs (6 cols) */}
        <div className="lg:col-span-6">
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-main pb-3">
              <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                AWS SES Outbound Email Logs
              </h3>
              <span className="text-[9px] font-bold text-primary bg-primary-glow px-2 py-0.5 rounded-full border border-primary/20">
                AWS SES SMTP Active
              </span>
            </div>

            {emailLogs.length > 0 ? (
              <div className="space-y-4">
                {emailLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-bg-main border border-border-main space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary truncate max-w-[170px]">
                        To: {log.recipient_email}
                      </span>
                      <span className="text-[8px] text-text-muted">
                        {new Date(log.sent_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="font-bold text-text-main text-[11px]">
                      Subject: {log.subject}
                    </div>
                    <p className="text-[10px] text-text-muted leading-relaxed whitespace-pre-line bg-bg-card border border-border-main p-2 rounded-lg font-mono">
                      {log.body}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic py-6 text-center">No emails logged in transmission.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
