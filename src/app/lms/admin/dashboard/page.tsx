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
  Award,
  X,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Application, EmailLog } from "@/lib/mockData";
import { getAtRiskStudents } from "@/lib/analytics";

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
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);

  const [surveyStats, setSurveyStats] = useState({
    preAverage: 0,
    postAverage: 0,
    countPre: 0,
    countPost: 0
  });

  const [atRisk, setAtRisk] = useState<ReturnType<typeof getAtRiskStudents>>([]);
  const [aiRiskBrief, setAiRiskBrief] = useState("");
  const [aiRiskLoading, setAiRiskLoading] = useState(false);

  const loadAdminDashboardData = () => {
    // Metrics
    const allApps = db.getApplications();
    setAppsCount(allApps.length);
    
    const allProfiles = db.getProfiles();
    setStudentsCount(allProfiles.filter((p) => p.role === "student").length);
    setInstructorsCount(allProfiles.filter((p) => p.role === "instructor").length);
    
    setCohortsCount(db.getCohorts().length);
    setCertsCount(db.getCertificates().length);

    // Recent 3 Pending Applications
    setRecentApps(allApps.filter((a) => a.status === "pending").slice(0, 3));

    // Last sent email
    setEmailLogs(db.getEmailLogs().slice(-1));

    // Survey aggregate averages
    const allResponses = db.getSurveyResponses();
    const preResponses = allResponses.filter(r => r.type === "pre");
    const postResponses = allResponses.filter(r => r.type === "post");

    let preSum = 0;
    let preCount = 0;
    preResponses.forEach(r => {
      Object.values(r.answers).forEach(val => {
        preSum += val;
        preCount++;
      });
    });

    let postSum = 0;
    let postCount = 0;
    postResponses.forEach(r => {
      Object.values(r.answers).forEach(val => {
        postSum += val;
        postCount++;
      });
    });

    setSurveyStats({
      preAverage: preCount > 0 ? Number((preSum / preCount).toFixed(1)) : 0,
      postAverage: postCount > 0 ? Number((postSum / postCount).toFixed(1)) : 0,
      countPre: preResponses.length,
      countPost: postResponses.length
    });

    setAtRisk(getAtRiskStudents());
  };

  useEffect(() => {
    loadAdminDashboardData();
    return db.subscribe(loadAdminDashboardData);
  }, [currentUser]);

  const handleAiRiskBrief = async () => {
    if (atRisk.length === 0) return;
    setAiRiskLoading(true);
    setAiRiskBrief("");
    try {
      const res = await fetch("/api/ai/at-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: atRisk.map((s) => ({
            name: s.name,
            phase: s.phase,
            avgGrade: s.avgGrade,
            completedModules: s.completedModules,
            flags: s.flags,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setAiRiskBrief(data.result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      alert(`AI risk briefing failed: ${msg}`);
    } finally {
      setAiRiskLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link href="/lms/admin/applications" className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4 hover:border-primary/50 transition-all duration-300 group cursor-pointer">
          <div className="p-3 rounded-xl bg-primary-glow text-primary group-hover:scale-110 transition-transform">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase group-hover:text-primary transition-colors">Applications</span>
            <span className="text-xl font-heading font-black text-text-main">{appsCount}</span>
          </div>
        </Link>

        <Link href="/lms/admin/students" className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4 hover:border-primary/50 transition-all duration-300 group cursor-pointer">
          <div className="p-3 rounded-xl bg-primary-glow text-primary group-hover:scale-110 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase group-hover:text-primary transition-colors">Trainees</span>
            <span className="text-xl font-heading font-black text-text-main">{studentsCount}</span>
          </div>
        </Link>

        <Link href="/lms/admin/users" className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4 hover:border-primary/50 transition-all duration-300 group cursor-pointer">
          <div className="p-3 rounded-xl bg-primary-glow text-primary group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase group-hover:text-primary transition-colors">Instructors</span>
            <span className="text-xl font-heading font-black text-text-main">{instructorsCount}</span>
          </div>
        </Link>

        <Link href="/lms/admin/cohorts" className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4 hover:border-primary/50 transition-all duration-300 group cursor-pointer">
          <div className="p-3 rounded-xl bg-primary-glow text-primary group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase group-hover:text-primary transition-colors">Cohorts</span>
            <span className="text-xl font-heading font-black text-text-main">{cohortsCount}</span>
          </div>
        </Link>

        <Link href="/lms/admin/students" className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4 hover:border-primary/50 transition-all duration-300 group cursor-pointer">
          <div className="p-3 rounded-xl bg-accent-glow text-accent group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase group-hover:text-accent transition-colors">Certificates</span>
            <span className="text-xl font-heading font-black text-text-main">{certsCount}</span>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Summary Views (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Pending Applications list */}
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-border-main pb-3">
              <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Admission Review Summary
              </h3>
              <Link
                href="/lms/admin/applications"
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                Go to Review Panel
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentApps.length > 0 ? (
              <div className="space-y-2.5">
                {recentApps.map((a) => (
                  <div key={a.id} className="p-3 bg-bg-main/40 border border-border-main rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-text-main">{a.applicant_name}</span>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold border uppercase ${
                          a.course_id === "property-advisor-hcpa"
                            ? "bg-secondary-glow border-secondary/20 text-secondary"
                            : "bg-primary-glow border-primary/20 text-primary"
                        }`}>
                          {a.course_id === "property-advisor-hcpa" ? "HCPA" : "HCEM"}
                        </span>
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5">{a.email}</div>
                    </div>
                    <Link
                      href="/lms/admin/applications"
                      className="text-[10px] font-bold text-primary bg-primary-glow px-2.5 py-1 rounded-lg border border-primary/10 hover:brightness-110"
                    >
                      Assess
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic py-4 text-center">No pending applications in queue.</p>
            )}
          </div>

          {/* At-Risk Students card */}
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-border-main pb-3">
              <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-error" />
                Students Needing Attention
                {atRisk.length > 0 && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-error/10 text-error border border-error/20">
                    {atRisk.length}
                  </span>
                )}
              </h3>
              {atRisk.length > 0 && (
                <button
                  type="button"
                  onClick={handleAiRiskBrief}
                  disabled={aiRiskLoading}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  {aiRiskLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" /> Summarizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" /> AI Summary
                    </>
                  )}
                </button>
              )}
            </div>

            {atRisk.length === 0 ? (
              <p className="text-xs text-text-muted italic py-4 text-center">No at-risk trainees detected. 🎉</p>
            ) : (
              <div className="space-y-3">
                {atRisk.slice(0, 6).map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-bg-main border border-border-main flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-main truncate">{s.name}</p>
                      <p className="text-[10px] text-text-muted truncate">
                        Phase {s.phase} · avg {s.avgGrade ?? "N/A"}% · {s.completedModules} modules
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[55%]">
                      {s.flags.map((f) => (
                        <span key={f} className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-error/10 text-error border border-error/20">
                          {f.replace("-", " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {atRisk.length > 6 && (
                  <p className="text-[10px] text-text-muted text-center">+{atRisk.length - 6} more</p>
                )}
              </div>
            )}

            {aiRiskBrief && (
              <div className="p-4 rounded-xl bg-error/5 border border-error/20 text-xs text-text-main leading-relaxed whitespace-pre-line">
                <span className="font-extrabold block mb-1 text-error">✨ AI Attention Brief</span>
                {aiRiskBrief}
              </div>
            )}
          </div>

          {/* Outcomes Harvesting Summary card */}
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-5 shadow-sm">
            <div className="flex justify-between items-center border-b border-border-main pb-3">
              <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-primary" />
                Outcome Harvesting Summary
              </h3>
              <Link
                href="/lms/admin/surveys"
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                Detailed Analytics
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 bg-bg-main/30 border border-border-main rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-text-muted uppercase block">Intake Baseline</span>
                <span className="text-lg font-heading font-black text-text-main">
                  {surveyStats.preAverage > 0 ? `${surveyStats.preAverage}/5.0` : "0.0"}
                </span>
              </div>
              <div className="p-3.5 bg-bg-main/30 border border-border-main rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-primary uppercase block">Graduate Competency</span>
                <span className="text-lg font-heading font-black text-primary">
                  {surveyStats.postAverage > 0 ? `${surveyStats.postAverage}/5.0` : "0.0"}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-secondary-glow/20 border border-secondary/15 rounded-xl text-[11px] text-text-muted leading-relaxed">
              Overall student competency upgraded by <strong className="text-secondary font-black">
                +{surveyStats.preAverage > 0 ? (surveyStats.postAverage - surveyStats.preAverage).toFixed(1) : "0.0"}
              </strong> rating points (+{surveyStats.preAverage > 0 ? (((surveyStats.postAverage - surveyStats.preAverage) / 5) * 100).toFixed(0) : 0}% of scale capacity).
            </div>

            <Link
              href="/lms/admin/surveys"
              className="btn w-full bg-primary text-text-inverse hover:brightness-110 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm block text-center"
            >
              Access Survey Outcomes Portal
            </Link>
          </div>
        </div>

        {/* Right Column: Analytics & Logs (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Simple Course Completion Analytics */}
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4 shadow-sm">
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

          {/* Last sent email */}
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-border-main pb-3">
              <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Latest Outbound Communication
              </h3>
              <Link
                href="/lms/admin/announcements"
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                Announcements Portal
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {emailLogs.length > 0 ? (
              <div 
                onClick={() => setSelectedEmail(emailLogs[0])}
                className="p-4 rounded-xl bg-bg-main border border-border-main space-y-2.5 transition-all hover:border-primary/45 cursor-pointer hover:bg-bg-main/55"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-primary truncate max-w-[180px]">
                    To: {emailLogs[0].recipient_email}
                  </span>
                  <span className="text-[9px] text-text-muted whitespace-nowrap bg-bg-card border border-border-main px-2 py-0.5 rounded">
                    {new Date(emailLogs[0].sent_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="font-bold text-text-main text-[11px] truncate">
                  Subject: {emailLogs[0].subject}
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed font-mono truncate">
                  {emailLogs[0].body}
                </p>
                <span className="text-[10px] text-primary font-bold hover:underline block pt-1 border-t border-border-main/40 mt-1">
                  Read Full Outbound log
                </span>
              </div>
            ) : (
              <p className="text-xs text-text-muted italic py-6 text-center">No emails logged in transmission.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Overlay for Email Log details */}
      {selectedEmail && (
        <div 
          className="fixed inset-0 bg-bg-main/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEmail(null)}
        >
          <div 
            className="premium-card rounded-2xl bg-bg-card border border-border-main max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl animate-scale-in relative max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEmail(null)}
              className="p-1.5 text-text-muted hover:text-text-main absolute right-4 top-4 rounded-lg hover:bg-bg-main transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-border-main pb-4">
              <span className="text-[9px] font-extrabold uppercase text-primary tracking-widest block">
                Outbound Email Log Details
              </span>
              <h3 className="font-heading font-extrabold text-sm sm:text-base text-text-main mt-0.5">
                Subject: {selectedEmail.subject}
              </h3>
              <p className="text-[9px] text-text-muted mt-1">
                Recipient: <strong className="text-primary">{selectedEmail.recipient_email}</strong> • Sent: {new Date(selectedEmail.sent_at).toLocaleString()}
              </p>
            </div>

            <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap bg-bg-main/30 border border-border-main p-4 rounded-xl font-mono">
              {selectedEmail.body}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
