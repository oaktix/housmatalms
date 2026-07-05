"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, GraduationCap, Activity, Calendar, Mail, X, FileText, Award, Download } from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Profile, GraduateStatus, Cohort, Certificate } from "@/lib/mockData";
import StudentProgressSection from "@/components/StudentProgressSection";
import { phase1Curriculum, hcpaCurriculum } from "@/lib/curriculum";
import confetti from "canvas-confetti";

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

  // Tab State
  const [rightTab, setRightTab] = useState<"progress" | "deployment" | "phase2class" | "submissions">("progress");

  // Form States
  const [status, setStatus] = useState<GraduateStatus["deployment_status"]>("Active");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

      {/* Directory Grid */}
      <div className="space-y-3 max-w-6xl mx-auto">
        <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider pl-2">
          Student & Graduate Directory ({students.length})
        </h3>

        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => {
              const prog = db.getProgress(student.id);
              const isReadyForPromotion = prog.current_phase === 2 && prog.phase2_status === "in-progress" && prog.phase2_attendance === "present";
              return (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student);
                    setStatus(student.grad?.deployment_status || "Active");
                    setNotes(student.grad?.placement_notes || "");
                    const prog = db.getProgress(student.id);
                    setMeetingUrl(prog.phase2_meeting_url || "");
                    setSuccessMsg("");
                    setRightTab("progress");
                  }}
                  className="p-5 rounded-2xl border text-left flex flex-col justify-between transition-all bg-bg-card border-border-main text-text-muted hover:text-text-main hover:bg-bg-card-hover hover:scale-[1.02] active:scale-[0.98] shadow-sm space-y-4"
                >
                  <div className="space-y-1 pr-4 min-w-0 w-full">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-text-main text-sm truncate">{student.full_name}</h4>
                      {prog.current_phase === 2 && prog.phase2_status === "in-progress" && (
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                          isReadyForPromotion
                            ? "bg-accent-glow text-accent border border-accent/20 animate-pulse"
                            : "bg-secondary-glow text-secondary border border-secondary/20"
                        }`}>
                          {isReadyForPromotion ? "Promotion Ready ⚡" : "Phase 2"}
                        </span>
                      )}
                      {prog.current_phase === 3 && (
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-accent text-white">
                          Phase 3
                        </span>
                      )}
                      {prog.current_phase === 4 && (
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-primary text-white">
                          Graduate
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Cohort: <strong className="text-text-main">{student.cohort?.name || "No Cohort Assigned"}</strong>
                    </p>
                    <p className="text-[10px] text-text-muted truncate">{student.email}</p>
                  </div>
                
                <div className="flex gap-2 items-center justify-between w-full pt-2 border-t border-border-main/50 text-[10px]">
                  <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    Certs: {student.certs.length}
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded border uppercase ${
                    student.grad?.deployment_status === "Assigned"
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : student.grad?.deployment_status === "Available"
                      ? "bg-secondary-glow border-secondary/20 text-secondary"
                      : "bg-warning/10 border-warning/20 text-warning"
                  }`}>
                    {student.grad?.deployment_status || "Available"}
                  </span>
                </div>
              </button>
            )})}
          </div>
        ) : (
          <p className="text-xs text-text-muted italic py-6 text-center">No students registered in the system.</p>
        )}
      </div>

      {/* Modal Overlay for Student Details */}
      {selectedStudent && (
        <div 
          className="fixed inset-0 bg-bg-main/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedStudent(null)}
        >
          <div 
            className="premium-card rounded-2xl bg-bg-card border border-border-main max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-in relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedStudent(null)}
              className="p-1.5 text-text-muted hover:text-text-main absolute right-4 top-4 rounded-lg hover:bg-bg-main transition-colors"
              title="Close panel"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>

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

            {/* Tab Selector */}
            <div className="flex gap-2 border-b border-border-main pb-3">
              <button
                type="button"
                onClick={() => setRightTab("progress")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  rightTab === "progress"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-bg-main border border-border-main text-text-muted hover:text-text-main"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Academic Progress
              </button>
              <button
                type="button"
                onClick={() => setRightTab("submissions")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  rightTab === "submissions"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-bg-main border border-border-main text-text-muted hover:text-text-main"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Submissions
              </button>
              <button
                type="button"
                onClick={() => setRightTab("phase2class")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  rightTab === "phase2class"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-bg-main border border-border-main text-text-muted hover:text-text-main"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Phase 2 Class
              </button>
              <button
                type="button"
                onClick={() => setRightTab("deployment")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  rightTab === "deployment"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-bg-main border border-border-main text-text-muted hover:text-text-main"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Deployment Status
              </button>
            </div>

            <div className="space-y-4">
              {rightTab === "progress" ? (
                <div className="space-y-4">
                  {(() => {
                    const prog = db.getProgress(selectedStudent.id);
                    if (prog.current_phase === 2 && prog.phase2_status === "in-progress") {
                      const hasAttended = prog.phase2_attendance === "present";
                      return (
                        <div className="p-4 border border-accent/20 bg-accent-glow/5 rounded-2xl space-y-3 animate-fade-in">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-black text-text-main flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-accent" />
                                Phase 2 Promotions Desk (Admin)
                              </h4>
                              <p className="text-[10px] text-text-muted mt-1">
                                {hasAttended
                                  ? "Student has completed all live class requirements and is eligible for Phase 3 field practicals."
                                  : "Student must attend class (marked present) before promotion."}
                              </p>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${hasAttended ? "bg-accent/15 text-accent animate-pulse" : "bg-bg-main text-text-muted border border-border-main"}`}>
                              {hasAttended ? "Ready" : "In Progress"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              db.promoteToPhase3(selectedStudent.id);
                              confetti({
                                particleCount: 80,
                                spread: 70,
                                origin: { y: 0.6 }
                              });
                              loadStudents();
                              // Refresh student details state in modal
                              const allStds = db.getProfiles().filter(p => p.role === "student");
                              const matched = allStds.find(s => s.id === selectedStudent.id);
                              if (matched) {
                                const cohort = db.getStudentCohort(matched.id);
                                const grad = db.getGraduateStatus(matched.id) || {
                                  deployment_status: "Available" as const,
                                  placement_notes: "Awaiting cohort final capstone.",
                                };
                                const certs = db.getCertificates(matched.id);
                                setSelectedStudent({ ...matched, cohort, grad, certs });
                              }
                            }}
                            className="btn w-full bg-accent text-white hover:brightness-110 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <GraduationCap className="w-4 h-4" />
                            Promote Student to Phase 3
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <StudentProgressSection studentId={selectedStudent.id} />
                </div>
              ) : rightTab === "submissions" ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-text-main flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary" />
                    Assignment Submissions Registry
                  </h4>
                  <p className="text-[10px] text-text-muted">Review this student&apos;s uploaded assignments, feedback, and grading scores.</p>
                  
                  {(() => {
                    const prog = db.getProgress(selectedStudent.id);
                    const activeCurriculum = prog.course_id === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;
                    const studentSubs = db.getStudentSubmissions(selectedStudent.id);
                    
                    return (
                      <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                        {activeCurriculum.map((mod) => {
                          const assignment = db.getAssignments(mod.id)[0];
                          if (!assignment) return null;
                          
                          const sub = studentSubs.find(s => s.assignment_id === assignment.id);
                          
                          return (
                            <div key={mod.id} className="p-4 bg-bg-main border border-border-main rounded-xl space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className="text-[9px] font-bold text-text-muted block uppercase">{mod.title.split(":")[0]}</span>
                                  <span className="font-bold text-xs text-text-main">{assignment.title}</span>
                                </div>
                                <span>
                                  {!sub && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-bg-card border border-border-main text-text-muted">
                                      Not Submitted
                                    </span>
                                  )}
                                  {sub && sub.status === "pending" && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-secondary-glow text-secondary border border-secondary/20">
                                      Awaiting Review
                                    </span>
                                  )}
                                  {sub && sub.status === "graded" && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary-glow text-primary border border-primary/20">
                                      Graded ({sub.grade}/100)
                                    </span>
                                  )}
                                  {sub && sub.status === "rejected" && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-error/15 text-error border border-error/20">
                                      Resubmission Requested
                                    </span>
                                  )}
                                </span>
                              </div>
                              
                              {sub && (
                                <div className="space-y-2 border-t border-border-main/50 pt-2.5 text-[11px] text-text-muted">
                                  <div className="flex justify-between items-center bg-bg-card p-2 rounded-lg border border-border-main">
                                    <span className="truncate max-w-[200px] font-medium text-text-main flex items-center gap-1.5">
                                      <FileText className="w-3.5 h-3.5 text-text-muted" />
                                      {sub.content_file_name || "submission-document.pdf"}
                                    </span>
                                    <a
                                      href={sub.content_link}
                                      download={sub.content_file_name || "submission.pdf"}
                                      className="text-primary hover:text-primary-glow font-bold flex items-center gap-0.5 text-[10px]"
                                    >
                                      <Download className="w-3 h-3" /> Download
                                    </a>
                                  </div>
                                  
                                  {sub.feedback && (
                                    <div className="p-2.5 bg-bg-card border border-border-main rounded-lg space-y-1">
                                      <span className="text-[9px] font-bold text-text-main block uppercase">Instructor Feedback:</span>
                                      <p className="italic text-text-muted">{sub.feedback}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ) : rightTab === "phase2class" ? (
                /* Phase 2 Class Control Panel */
                <div className="space-y-6">
                  {(() => {
                    const progress = db.getProgress(selectedStudent.id);
                    if (progress.current_phase < 2) {
                      return (
                        <div className="p-8 text-center bg-bg-main border border-border-main rounded-2xl text-xs text-text-muted space-y-2">
                          <p className="font-bold text-text-main">Phase 2 Locked</p>
                          <p>This student is currently in Phase {progress.current_phase} and has not unlocked Phase 2 yet.</p>
                        </div>
                      );
                    }

                    const handleSendMeetingLink = (e: React.FormEvent) => {
                      e.preventDefault();
                      const updated = {
                        ...progress,
                        phase2_meeting_url: meetingUrl,
                      };
                      db.updateProgress(updated);
                      db.logEmail(
                        selectedStudent.email,
                        "Meeting Link for Phase 2 Live Class",
                        `Hello ${selectedStudent.full_name},\n\nYour instructor has uploaded and sent the meeting link for your selected Phase 2 virtual class (${progress.selected_class || "N/A"}):\n\nJoin link: ${meetingUrl}\n\nBest regards,\nHousmata Academy Admin`
                      );
                      setSuccessMsg("Meeting link updated and email notification sent successfully!");
                      setTimeout(() => setSuccessMsg(""), 3000);
                    };

                    const handleMarkAttendance = (attStatus: "present" | "absent" | "pending") => {
                      const updated = {
                        ...progress,
                        phase2_attendance: attStatus === "pending" ? undefined : attStatus,
                      };
                      db.updateProgress(updated);
                      setSuccessMsg(`Attendance status updated to: ${attStatus.toUpperCase()}`);
                      setTimeout(() => setSuccessMsg(""), 3000);
                    };

                    return (
                      <div className="space-y-6">
                        {successMsg && (
                          <div className="p-3 bg-primary-glow border border-primary/25 text-primary text-xs font-semibold rounded-lg animate-fade-in">
                            {successMsg}
                          </div>
                        )}

                        <div className="p-4 bg-bg-main border border-border-main rounded-xl space-y-1">
                          <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Class Selection Status</span>
                          <span className="font-heading font-black text-xs text-text-main">
                            {progress.selected_class ? (
                              <span className="text-secondary flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> {progress.selected_class}
                              </span>
                            ) : (
                              <span className="text-warning">No slot selected yet.</span>
                            )}
                          </span>
                        </div>

                        {progress.selected_class && (
                          <>
                            {/* Send Link Form */}
                            <form onSubmit={handleSendMeetingLink} className="space-y-4 border border-border-main p-4 rounded-xl">
                              <h4 className="text-xs font-bold text-text-main flex items-center gap-1.5">
                                <Mail className="w-4 h-4 text-primary" />
                                Send Virtual Class Meeting Link
                              </h4>
                              <p className="text-[10px] text-text-muted">Enter the virtual meeting link (Google Meet, Zoom, etc.) to share with this student.</p>
                              
                              <div className="form-group">
                                <input
                                  type="url"
                                  required
                                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                  value={meetingUrl}
                                  onChange={(e) => setMeetingUrl(e.target.value)}
                                  className="w-full text-xs bg-bg-main border border-border-main rounded-xl px-3 py-2 text-text-main focus:outline-none focus:border-primary"
                                />
                              </div>

                              <button
                                type="submit"
                                className="btn bg-primary text-white hover:brightness-110 px-4 py-2 rounded-lg font-bold text-xs transition-all"
                              >
                                Send Meeting Link
                              </button>
                            </form>

                            {/* Attendance Marking */}
                            <div className="border border-border-main p-4 rounded-xl space-y-4">
                              <h4 className="text-xs font-bold text-text-main flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                Mark Live Class Attendance
                              </h4>
                              <p className="text-[10px] text-text-muted">Update student attendance status after class completion.</p>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleMarkAttendance("present")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    progress.phase2_attendance === "present"
                                      ? "bg-primary text-white"
                                      : "bg-bg-main border border-border-main text-text-muted hover:text-text-main"
                                  }`}
                                >
                                  Mark Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMarkAttendance("absent")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    progress.phase2_attendance === "absent"
                                      ? "bg-error text-white"
                                      : "bg-bg-main border border-border-main text-text-muted hover:text-text-main"
                                  }`}
                                >
                                  Mark Absent
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMarkAttendance("pending")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    !progress.phase2_attendance
                                      ? "bg-text-muted text-white"
                                      : "bg-bg-main border border-border-main text-text-muted hover:text-text-main"
                                  }`}
                                >
                                  Reset Status
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Status Update Form */
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
                        className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary"
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
                      className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn bg-primary text-white hover:brightness-110 w-full py-3 rounded-xl font-bold text-xs transition-all"
                  >
                    Save Status Update
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
