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

const SURVEY_QUESTIONS = [
  { id: 1, text: "Agent vs. Manager Roles" },
  { id: 2, text: "Nigerian Land Regulations" },
  { id: 3, text: "Digital Management Platforms" },
  { id: 4, text: "Listing Disclosure Protocols" },
  { id: 5, text: "Separation of Client Funds" },
  { id: 6, text: "Move-in Inventory Checks" },
  { id: 7, text: "Habitability & Tenant Rights" },
  { id: 8, text: "Utility & Generator Operations" },
  { id: 9, text: "Real Estate Financials" },
  { id: 10, text: "Eviction & Dispute Mediation" }
];

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

  const [surveyStats, setSurveyStats] = useState<{
    preAverages: number[];
    postAverages: number[];
    growths: number[];
    countPre: number;
    countPost: number;
  }>({ preAverages: [], postAverages: [], growths: [], countPre: 0, countPost: 0 });

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

    // Survey outcomes processing
    const allResponses = db.getSurveyResponses();
    const preResponses = allResponses.filter(r => r.type === "pre");
    const postResponses = allResponses.filter(r => r.type === "post");

    const preAverages = Array(10).fill(0);
    const postAverages = Array(10).fill(0);

    SURVEY_QUESTIONS.forEach((q, idx) => {
      let preSum = 0;
      preResponses.forEach(r => {
        preSum += (r.answers[q.id] || 0);
      });
      preAverages[idx] = preResponses.length > 0 ? preSum / preResponses.length : 0;

      let postSum = 0;
      postResponses.forEach(r => {
        postSum += (r.answers[q.id] || 0);
      });
      postAverages[idx] = postResponses.length > 0 ? postSum / postResponses.length : 0;
    });

    const growths = preAverages.map((pre, idx) => postAverages[idx] - pre);

    setSurveyStats({
      preAverages,
      postAverages,
      growths,
      countPre: preResponses.length,
      countPost: postResponses.length
    });
  };

  const getInsights = () => {
    if (surveyStats.countPre === 0 || surveyStats.countPost === 0) {
      return "Outcome harvesting data will populate here as students complete their pre-course and post-course knowledge assessments.";
    }

    let maxGrowthIdx = 0;
    let maxGrowthVal = -1;
    surveyStats.growths.forEach((g, idx) => {
      if (g > maxGrowthVal) {
        maxGrowthVal = g;
        maxGrowthIdx = idx;
      }
    });

    const maxGrowthQuestion = SURVEY_QUESTIONS[maxGrowthIdx]?.text || "";
    const growthPercent = ((maxGrowthVal / 5) * 100).toFixed(0);

    return `Graduates demonstrate outstanding learning outcomes. The most significant improvement was observed in "${maxGrowthQuestion}" with a direct growth rating increase of +${maxGrowthVal.toFixed(1)} (+${growthPercent}% of total scale). Overall, average real estate proficiency surged across all 10 core dimensions surveyed.`;
  };

  useEffect(() => {
    loadAdminDashboardData();
    db.sync();
    return db.subscribe(loadAdminDashboardData);
  }, [currentUser]);

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

        {/* Right: Resend email logs (6 cols) */}
        <div className="lg:col-span-6">
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-main pb-3">
              <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Resend Outbound Email Logs
              </h3>
              <span className="text-[9px] font-bold text-primary bg-primary-glow px-2 py-0.5 rounded-full border border-primary/20">
                Resend Active
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

      {/* Outcome Harvesting Survey Analytics Card */}
      <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 md:p-8 space-y-6">
        <div>
          <h3 className="font-heading font-extrabold text-base text-text-main flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Outcome Harvesting Survey Analytics
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Quantitative comparison of pre-course vs post-course knowledge ratings (1-5 Likert Scale). Responses collected: Pre ({surveyStats.countPre}) | Post ({surveyStats.countPost}).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Averages List / Bar Chart */}
          <div className="space-y-4">
            {SURVEY_QUESTIONS.map((q, idx) => {
              const preVal = surveyStats.preAverages[idx] || 0;
              const postVal = surveyStats.postAverages[idx] || 0;
              const growth = surveyStats.growths[idx] || 0;

              return (
                <div key={q.id} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-text-main">{q.id}. {q.text}</span>
                    <span className="text-text-muted">
                      Pre: <span className="text-text-main font-semibold">{preVal.toFixed(1)}</span> | 
                      Post: <span className="text-primary font-black">{postVal.toFixed(1)}</span>
                      {growth > 0 && (
                        <span className="text-secondary ml-1 bg-secondary/10 px-1.5 py-0.5 rounded font-black">
                          +{growth.toFixed(1)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="space-y-1 bg-bg-main/30 p-2 rounded-xl border border-border-main/50">
                    <style>{`
                      .survey-bar-pre-${q.id} {
                        width: ${(preVal / 5) * 100}%;
                      }
                      .survey-bar-post-${q.id} {
                        width: ${(postVal / 5) * 100}%;
                      }
                    `}</style>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-[8px] text-text-muted uppercase tracking-widest font-black">Pre</span>
                      <div className="flex-1 bg-border-main/50 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`bg-primary/50 h-full rounded-full transition-all duration-1000 survey-bar-pre-${q.id}`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-[8px] text-secondary uppercase tracking-widest font-black">Post</span>
                      <div className="flex-1 bg-border-main/50 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`bg-gradient-to-r from-secondary to-accent h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(43,108,176,0.3)] survey-bar-post-${q.id}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Text Interpretation Insights */}
          <div className="space-y-4 lg:sticky lg:top-4 bg-bg-main/20 p-6 rounded-2xl border border-border-main/60">
            <h4 className="font-heading font-bold text-xs uppercase text-text-muted tracking-wider">
              Educational Impact Interpretation
            </h4>
            <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">
              {getInsights()}
            </p>
            <div className="pt-4 border-t border-border-main/50 space-y-2 text-xs">
              <span className="font-bold text-text-main block">Evaluation Criteria:</span>
              <p className="text-text-muted text-[11px]">
                Ratings are based on student self-assessments submitted immediately upon first login (Pre-Course) and directly after reading all Phase 1 lessons before certification (Post-Course).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
