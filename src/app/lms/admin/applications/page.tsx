"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserCheck, ChevronRight, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Application, Cohort } from "@/lib/mockData";

export default function AdminApplications() {
  const { currentUser } = useAuth();
  
  // Data States
  const [apps, setApps] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [targetCohortId, setTargetCohortId] = useState("");

  const [message, setMessage] = useState("");

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
  }, [currentUser, loadApplications]);

  const handleApprove = () => {
    if (!selectedApp || !targetCohortId) return;

    db.updateApplicationStatus(selectedApp.id, "approved", targetCohortId);
    
    setMessage(`Application for ${selectedApp.applicant_name} approved and assigned to cohort!`);
    loadApplications();
    
    setTimeout(() => {
      setMessage("");
      setSelectedApp(null);
    }, 2000);
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Applications list (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
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
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedApp?.id === a.id
                        ? "bg-primary-glow border-primary text-text-main"
                        : "bg-bg-card border-border-main text-text-muted hover:text-text-main hover:bg-bg-card-hover"
                    }`}
                  >
                    <div className="space-y-1 pr-4 min-w-0 flex-grow">
                      <h4 className="font-bold text-text-main text-xs truncate">{a.applicant_name}</h4>
                      <p className="text-[10px] text-text-muted">State: {a.state} • Exp: {a.experience_level || "Beginner"}</p>
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
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl bg-bg-card/50 border border-border-main flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1 min-w-0 flex-grow pr-4">
                      <h4 className="font-bold text-text-main truncate">{a.applicant_name}</h4>
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic pl-2">No decision history recorded.</p>
            )}
          </div>
        </div>

        {/* Right Column: Application Details Panel (7 cols) */}
        <div className="lg:col-span-7">
          {selectedApp ? (
            <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-6 shadow-md animate-fade-in">
              <div className="border-b border-border-main pb-4">
                <span className="text-[9px] font-extrabold uppercase text-primary tracking-widest block">
                  Admission Review
                </span>
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

              {/* Action buttons with Cohort Selector */}
              <div className="pt-6 border-t border-border-main space-y-4">
                <div className="form-group">
                  <label htmlFor="targetCohort" className="text-[10px] font-bold text-text-muted block mb-1">
                    Assign to Active Cohort
                  </label>
                  <select
                    id="targetCohort"
                    value={targetCohortId}
                    onChange={(e) => setTargetCohortId(e.target.value)}
                    className="max-w-xs"
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
                    className="btn bg-primary text-text-inverse hover:brightness-110 flex-grow py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approve & Onboard Student
                  </button>
                  <button
                    onClick={handleReject}
                    className="btn btn-secondary border border-border-main hover:bg-error/5 hover:text-error hover:border-error/20 text-text-muted px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-text-muted bg-bg-card border border-border-main rounded-2xl italic">
              Select a pending candidate from the left queue to review admission details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
