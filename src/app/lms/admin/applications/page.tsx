"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserCheck, ChevronRight, XCircle, X, Sparkles, Sparkle, Loader2 } from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Application, Cohort } from "@/lib/mockData";
import { useToast } from "@/components/ui/Toast";

export default function AdminApplications() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Data States
  const [apps, setApps] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [targetCohortId, setTargetCohortId] = useState("");

  const [message, setMessage] = useState("");
  const [aiScreen, setAiScreen] = useState("");
  const [aiScreenLoading, setAiScreenLoading] = useState(false);

  const loadApplications = useCallback(() => {
    setApps(db.getApplications());
    const allCohorts = db.getCohorts();
    setCohorts(allCohorts);
    if (allCohorts.length > 0 && !targetCohortId) {
      setTargetCohortId(allCohorts[0].id);
    }
  }, [targetCohortId]);

  useEffect(() => {
    loadApplications();
    return db.subscribe(loadApplications);
  }, [currentUser, loadApplications]);

  const handleAiScreen = async () => {
    if (!selectedApp) return;
    setAiScreenLoading(true);
    setAiScreen("");
    try {
      const res = await fetch("/api/ai/screen-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicant_name: selectedApp.applicant_name,
          state: selectedApp.state,
          experience_level: selectedApp.experience_level,
          course_id: selectedApp.course_id,
          motivation: selectedApp.motivation,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setAiScreen(data.result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast(`AI screening failed: ${msg}`, "error");
    } finally {
      setAiScreenLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp || !targetCohortId) return;

    try {
      await db.updateApplicationStatus(selectedApp.id, "approved", targetCohortId);
      setMessage(`Application for ${selectedApp.applicant_name} approved: student account created!`);
    } catch (err) {
      console.error("Approval failed:", err);
      setMessage(`Approval failed: ${err instanceof Error ? err.message : "Unknown error. Check browser console."}`);
    }

    loadApplications();
    
    setTimeout(() => {
      setMessage("");
      setSelectedApp(null);
    }, 3000);
  };

  const handleReject = () => {
    if (!selectedApp) return;

    db.updateApplicationStatus(selectedApp.id, "rejected");
    
    setMessage(`Application for ${selectedApp.applicant_name} rejected.`);
    loadApplications();

    setTimeout(() => {
      setMessage("");
      setSelectedApp(null);
    }, 2000);
  };

  const handleRescind = () => {
    if (!selectedApp) return;

    db.rescindApplicationApproval(selectedApp.id);
    
    setMessage(`Application for ${selectedApp.applicant_name} has been rescinded.`);
    loadApplications();

    setTimeout(() => {
      setMessage("");
      setSelectedApp(null);
    }, 2000);
  };

  const handleResetToPending = () => {
    if (!selectedApp) return;

    db.resetApplicationToPending(selectedApp.id);
    
    setMessage(`Application for ${selectedApp.applicant_name} reset to pending.`);
    loadApplications();

    setTimeout(() => {
      setMessage("");
      setSelectedApp(null);
    }, 2000);
  };

  const pendingApps = apps.filter((a) => a.status === "pending");
  const reviewedApps = apps.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border-main pb-4">
        <h1 className="text-lg font-heading font-bold text-text-main flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" />
          Admissions Review Board
        </h1>
      </div>

      {message && (
        <div className="p-3 bg-primary-glow border border-primary/25 text-primary text-xs font-semibold rounded-lg">
          {message}
        </div>
      )}

      {/* Grid of lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">
        {/* Pending Queue */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider pl-2">
            Pending Candidates ({pendingApps.length})
          </h3>
          
          {pendingApps.length > 0 ? (
            <div className="space-y-2">
              {pendingApps.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedApp(a)}
                  className="w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all bg-bg-card border-border-main text-text-muted hover:text-text-main hover:bg-bg-card-hover hover:scale-[1.01] active:scale-[0.99] shadow-sm"
                >
                  <div className="space-y-1 pr-4 min-w-0 flex-grow">
                    <h4 className="font-bold text-text-main text-xs truncate">{a.applicant_name}</h4>
                    <p className="text-[10px] text-text-muted">State: {a.state} • Exp: {a.experience_level || "Beginner"}</p>
                    <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border uppercase ${
                      a.course_id === "property-advisor-hcpa"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-primary-glow border-primary/20 text-primary"
                    }`}>
                      {a.course_id === "property-advisor-hcpa" ? "HCPA" : "HCEM"}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-bg-card border border-border-main text-center text-xs text-text-muted italic">
              No pending admission applications.
            </div>
          )}
        </div>

        {/* Admissions History */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider pl-2">
            Admissions Decisions History ({reviewedApps.length})
          </h3>

          {reviewedApps.length > 0 ? (
            <div className="space-y-2">
              {reviewedApps.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedApp(a)}
                  className="w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all bg-bg-card border-border-main text-text-muted hover:text-text-main hover:bg-bg-card-hover hover:scale-[1.01] active:scale-[0.99] shadow-sm"
                >
                  <div className="space-y-1 min-w-0 flex-grow pr-4">
                    <h4 className="font-bold text-text-main truncate text-xs">{a.applicant_name}</h4>
                    <p className="text-[10px] text-text-muted">{a.email}</p>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                      a.status === "approved"
                        ? "bg-primary-glow border-primary/20 text-primary"
                        : "bg-error/10 border-error/20 text-error"
                    }`}
                  >
                    {a.status}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-bg-card border border-border-main text-center text-xs text-text-muted italic">
              No decision history recorded.
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay for Application Details */}
      {selectedApp && (
        <div 
          className="fixed inset-0 bg-bg-main/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedApp(null)}
        >
          <div 
            className="premium-card rounded-2xl bg-bg-card border border-border-main max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-in relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedApp(null)}
              className="p-1.5 text-text-muted hover:text-text-main absolute right-4 top-4 rounded-lg hover:bg-bg-main transition-colors"
              title="Close panel"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-border-main pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-extrabold uppercase text-primary tracking-widest block">
                  Admission Review
                </span>
                <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                  selectedApp.course_id === "property-advisor-hcpa"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-primary-glow border-primary/20 text-primary"
                }`}>
                  {selectedApp.course_id === "property-advisor-hcpa" ? "Housmata Certified Property Advisor (HCPA)" : "Housmata Certified Estate Manager (HCEM)"}
                </span>
              </div>
              <h3 className="font-heading font-extrabold text-sm sm:text-base text-text-main mt-0.5">
                {selectedApp.applicant_name}
              </h3>
              <p className="text-[10px] text-text-muted mt-1">
                Email: {selectedApp.email} • Phone: {selectedApp.phone}
              </p>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase block">State of Residence</span>
                <span className="font-semibold text-text-main">{selectedApp.state}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase block">Experience Profile</span>
                <span className="font-semibold text-text-main">{selectedApp.experience_level || "Beginner"}</span>
              </div>
            </div>

            {/* Motivation */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Motivation Statement:
              </span>
              <div className="p-4 rounded-xl bg-bg-main border border-border-main text-xs sm:text-sm text-text-muted leading-relaxed whitespace-pre-line">
                {selectedApp.motivation || "No statement submitted."}
              </div>
            </div>

            {/* AI Screening */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleAiScreen}
                disabled={aiScreenLoading}
                className="btn border border-primary/30 hover:bg-primary/5 text-primary px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {aiScreenLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Screening...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> AI Screen Application
                  </>
                )}
              </button>
              {aiScreen && (
                <div className="p-4 rounded-xl bg-primary-glow/20 border border-primary/20 text-xs text-text-main leading-relaxed whitespace-pre-line">
                  <span className="font-extrabold block mb-1 text-primary flex items-center gap-1.5">
                    <Sparkle className="w-3.5 h-3.5" />
                    AI Screening Recommendation
                  </span>
                  {aiScreen}
                </div>
              )}
            </div>

            {/* Action buttons with Cohort Selector */}
            <div className="pt-6 border-t border-border-main space-y-4">
              {selectedApp.status === "pending" ? (
                <>
                  <div className="form-group">
                    <label htmlFor="targetCohort" className="text-[10px] font-bold text-text-muted block mb-1">
                      Assign to Active Cohort
                    </label>
                    <select
                      id="targetCohort"
                      value={targetCohortId}
                      onChange={(e) => setTargetCohortId(e.target.value)}
                      className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary"
                      aria-label="Assign to Active Cohort"
                    >
                      {cohorts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleApprove}
                      className="btn bg-primary text-white hover:brightness-110 flex-grow py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      Approve & Onboard Student
                    </button>
                    <button
                      onClick={handleReject}
                      className="btn border border-border-main hover:bg-error/5 hover:text-error hover:border-error/20 text-text-muted px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </>
              ) : selectedApp.status === "approved" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary-glow/20 border border-primary/25 text-xs text-text-muted space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="font-bold text-text-main">Currently Approved</span>
                    </div>
                    <p className="leading-relaxed">
                      This student is actively enrolled. Rescinding approval will deactivate their access credentials, remove them from their cohort, and reset all of their course progress, quizzes, and submissions.
                    </p>
                  </div>
                  <button
                    onClick={handleRescind}
                    className="btn bg-error text-white hover:brightness-110 w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Rescind Approval & Reset Progress
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-error/5 border border-error/10 text-xs text-text-muted space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-error" />
                      <span className="font-bold text-text-main">Currently Rejected</span>
                    </div>
                    <p className="leading-relaxed">
                      This application has been rejected. You can reset it to pending to place it back in the review queue.
                    </p>
                  </div>
                  <button
                    onClick={handleResetToPending}
                    className="btn border border-border-main hover:bg-bg-card-hover w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    Reset to Pending Status
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
