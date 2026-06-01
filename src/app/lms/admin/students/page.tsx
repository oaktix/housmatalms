"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Profile, GraduateStatus, Cohort, Certificate } from "@/lib/mockData";

type StudentWithDeployment = Profile & {
  cohort: Cohort | undefined;
  grad: Omit<GraduateStatus, "id" | "user_id" | "updated_at">;
  certs: Certificate[];
};

export default function AdminStudents() {
  const { currentUser } = useAuth();
  
  // Data States
  const [students, setStudents] = useState<StudentWithDeployment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDeployment | null>(null);

  // Form States
  const [status, setStatus] = useState<GraduateStatus["deployment_status"]>("Active");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const loadStudents = useCallback(() => {
    // Fetch all student profiles and join with cohort and graduate status
    const allStudents = db.getProfiles()
      .filter((p) => p.role === "student")
      .map((std) => {
        const cohort = db.getStudentCohort(std.id);
        const grad = db.getGraduateStatus(std.id) || {
          deployment_status: "Available" as const,
          placement_notes: "Awaiting cohort final capstone.",
        };
        const certs = db.getCertificates(std.id);
        return { ...std, cohort, grad, certs };
      });
    setStudents(allStudents);
  }, []);

  useEffect(() => {
    loadStudents();
    db.sync();
    return db.subscribe(loadStudents);
  }, [currentUser, loadStudents]);

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    db.updateGraduateStatus(selectedStudent.id, status, notes);

    setMessage(`Deployment status for ${selectedStudent.full_name} updated to ${status}!`);
    loadStudents();

    setTimeout(() => {
      setMessage("");
      setSelectedStudent(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border-main pb-4">
        <h1 className="text-lg font-heading font-bold text-text-main flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Graduate Deployment Registry
        </h1>
      </div>

      {message && (
        <div className="p-3 bg-primary-glow border border-primary/25 text-primary text-xs font-semibold rounded-lg">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Student List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider pl-2">
            Student & Graduate Directory ({students.length})
          </h3>

          {students.length > 0 ? (
            <div className="space-y-2">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student);
                    setStatus(student.grad?.deployment_status || "Active");
                    setNotes(student.grad?.placement_notes || "");
                  }}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedStudent?.id === student.id
                      ? "bg-primary-glow border-primary text-text-main"
                      : "bg-bg-card border-border-main text-text-muted hover:text-text-main hover:bg-bg-card-hover"
                  }`}
                >
                  <div className="space-y-1 pr-4 min-w-0 flex-grow">
                    <h4 className="font-bold text-text-main text-xs truncate">{student.full_name}</h4>
                    <p className="text-[10px] text-text-muted">
                      Cohort: <strong>{student.cohort?.name || "No Cohort"}</strong>
                    </p>
                    <div className="flex gap-2 items-center pt-1 text-[9px]">
                      <span className="font-semibold text-primary">
                        Certs: {student.certs.length}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-secondary">
                        Status: {student.grad?.deployment_status || "Available"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic py-6 text-center">No students registered in the system.</p>
          )}
        </div>

        {/* Right Column: Edit Deployment Status (7 cols) */}
        <div className="lg:col-span-7">
          {selectedStudent ? (
            <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-6 shadow-md animate-fade-in">
              <div className="border-b border-border-main pb-4">
                <span className="text-[9px] font-extrabold uppercase text-primary tracking-widest block">
                  Status Tracking Profile
                </span>
                <h3 className="font-heading font-extrabold text-sm sm:text-base text-text-main mt-0.5">
                  {selectedStudent.full_name}
                </h3>
                <p className="text-[10px] text-text-muted mt-1">
                  Email: {selectedStudent.email} • Assigned Cohort: {selectedStudent.cohort?.name || "None"}
                </p>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="status" className="text-[10px] font-bold text-text-muted block mb-1">
                      Select Deployment Status
                    </label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as GraduateStatus["deployment_status"])}
                    >
                      <option value="Active">Active (In training)</option>
                      <option value="Available">Available (Certified & seeking deployment)</option>
                      <option value="Assigned">Assigned (Deployed to active estate portfolio)</option>
                      <option value="Suspended">Suspended (Credential paused/revoked)</option>
                      <option value="Alumni">Alumni (Retired / ecosystem transition)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes" className="text-[10px] font-bold text-text-muted block mb-1">
                    Placement & Tracking Remarks
                  </label>
                  <textarea
                    id="notes"
                    placeholder="e.g. Deployed to Property Max Block 4 Facilties on 2026-06-01..."
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn bg-primary text-text-inverse hover:brightness-110 w-full py-3 rounded-xl font-bold text-xs"
                >
                  Save Status Update
                </button>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-text-muted bg-bg-card border border-border-main rounded-2xl italic">
              Select a student from the left directory to track and update their deployment status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
