"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ClipboardList, CheckCircle2, ChevronRight, GraduationCap, FileText } from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Submission, Assignment, Profile, StudentProgress } from "@/lib/mockData";
import confetti from "canvas-confetti";

type SubmissionWithDetails = Submission & {
  student: Profile | undefined;
  assignment: Assignment | undefined;
  quizScore: number;
  finalGrades: { assignmentGrade: number; quizScore: number; finalGrade: number } | null;
};

type StudentWithProgress = {
  profile: Profile;
  progress: StudentProgress;
};

export default function InstructorGrading() {
  const { currentUser } = useAuth();
  
  // Data States
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [phase2Students, setPhase2Students] = useState<StudentWithProgress[]>([]);
  const [selectedSub, setSelectedSub] = useState<SubmissionWithDetails | null>(null);

  // UI States
  const [activeTab, setActiveTab] = useState<"assignments" | "promotions">("assignments");

  // Form States
  const [grade, setGrade] = useState<number>(85);
  const [feedback, setFeedback] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Track in-progress conversions to prevent duplicate parallel requests
  const convertingIds = useRef<Set<string>>(new Set());

  const loadData = useCallback(() => {
    // 1. Fetch Submissions
    const allSubs = db.getSubmissions().map((sub) => {
      const student = db.getProfile(sub.user_id);
      const assignment = db.getAssignment(sub.assignment_id);
      
      let quizScore = 0;
      let finalGrades = null;
      if (assignment && student) {
        const quizzes = db.getQuizzes(assignment.module_id);
        if (quizzes.length > 0) {
          const attempts = db.getQuizAttempts(student.id).filter(a => a.quiz_id === quizzes[0].id && a.passed);
          if (attempts.length > 0) {
            quizScore = Math.max(...attempts.map(a => a.score));
          }
        }
        finalGrades = db.getFinalModuleGrade(student.id, assignment.module_id);
      }

      return { ...sub, student, assignment, quizScore, finalGrades };
    });
    setSubmissions(allSubs);

    // 2. Fetch Phase 2 Students
    const allStudents = db.getProfiles().filter(p => p.role === "student");
    const phase2 = allStudents.map(student => ({
      profile: student,
      progress: db.getProgress(student.id)
    })).filter(s => s.progress.current_phase === 2 && s.progress.phase2_status === "in-progress");
    
    setPhase2Students(phase2);
  }, []);

  useEffect(() => {
    loadData();
    db.sync();
    return db.subscribe(loadData);
  }, [currentUser, loadData]);

  useEffect(() => {
    // Auto-heal legacy PowerPoint submissions by converting them to PDF
    const allSubs = db.getSubmissions();
    const pptxSubs = allSubs.filter((sub) => 
      sub.content_link && 
      (sub.content_file_name?.toLowerCase().endsWith(".pptx") || sub.content_file_name?.toLowerCase().endsWith(".ppt")) &&
      !sub.content_link.startsWith("data:application/pdf") &&
      !convertingIds.current.has(sub.id)
    );

    if (pptxSubs.length > 0) {
      console.log(`[PPTX Auto-Heal] Found ${pptxSubs.length} legacy PowerPoint submissions to convert to PDF.`);
      pptxSubs.forEach(async (sub) => {
        convertingIds.current.add(sub.id);
        try {
          const res = await fetch("/api/convert-pptx", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileDataUrl: sub.content_link,
              fileName: sub.content_file_name,
            }),
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.pdfDataUrl) {
              db.updateSubmission({
                ...sub,
                content_link: data.pdfDataUrl,
                content_file_name: sub.content_file_name!.replace(/\.pptx?$/i, ".pdf")
              });
              loadData();
            }
          }
        } catch (err) {
          console.error("Auto-conversion of legacy presentation failed:", sub.id, err);
        } finally {
          convertingIds.current.delete(sub.id);
        }
      });
    }
  }, [submissions, loadData]);

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    db.gradeSubmission(selectedSub.id, Number(grade), feedback);

    setSuccessMsg("Grade and feedback saved successfully!");
    setFeedback("");
    loadData();
    
    setTimeout(() => {
      setSuccessMsg("");
      setSelectedSub(null);
    }, 1500);
  };

  const handleRequestResubmission = () => {
    if (!selectedSub) return;
    if (!feedback.trim()) {
      alert("Please provide feedback explaining why resubmission is requested.");
      return;
    }

    db.requestResubmission(selectedSub.id, feedback);

    setSuccessMsg("Resubmission requested successfully!");
    setFeedback("");
    loadData();
    
    setTimeout(() => {
      setSuccessMsg("");
      setSelectedSub(null);
    }, 1500);
  };

  const handlePromoteToPhase3 = (studentId: string) => {
    db.promoteToPhase3(studentId);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#26c496', '#2b6cb0']
    });
    loadData();
  };

  const pendingSubs = submissions.filter((s) => s.status === "pending");
  const gradedSubs = submissions.filter((s) => s.status === "graded");

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Header bar */}
      <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-heading font-black text-text-main flex items-center gap-2">
            <ClipboardList className="w-5.5 h-5.5 text-primary" />
            Instructor Assessment Desk
          </h1>
          <p className="text-xs text-text-muted">Grade assignments, request student resubmissions, and promote students into Phase 3.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-bg-main border border-border-main rounded-xl text-xs font-bold">
          <button
            onClick={() => { setActiveTab("assignments"); setSelectedSub(null); }}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "assignments" ? "bg-primary text-text-inverse shadow-sm" : "text-text-muted hover:text-text-main"
            }`}
          >
            Digital Assignments ({pendingSubs.length})
          </button>
          <button
            onClick={() => { setActiveTab("promotions"); setSelectedSub(null); }}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "promotions" ? "bg-accent text-text-inverse shadow-sm" : "text-text-muted hover:text-text-main"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Phase 2 Promotions
            {phase2Students.length > 0 && (
              <span className="w-4 h-4 bg-error text-white rounded-full flex items-center justify-center text-[9px]">
                {phase2Students.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-primary-glow border border-primary/25 text-primary text-xs font-semibold rounded-xl animate-fade-in shadow-sm">
          {successMsg}
        </div>
      )}

      {activeTab === "assignments" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Left Column: Submissions Queue List (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Pending Queue */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-text-muted uppercase tracking-widest pl-2">
                Waiting for Assessment ({pendingSubs.length})
              </h3>
              
              {pendingSubs.length > 0 ? (
                <div className="space-y-2.5">
                  {pendingSubs.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedSub(sub);
                        setGrade(85);
                        setFeedback("");
                      }}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        selectedSub?.id === sub.id
                          ? "bg-primary-glow border-primary text-text-main shadow-sm"
                          : "bg-bg-card border-border-main text-text-muted hover:text-text-main hover:bg-bg-card-hover"
                      }`}
                    >
                      <div className="space-y-1 pr-4 min-w-0 flex-grow">
                        <h4 className="font-bold text-text-main text-xs truncate">
                          {sub.assignment?.title || "Assignment"}
                        </h4>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Submitted by: <strong className="text-text-main">{sub.student?.full_name}</strong>
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-bg-card border border-border-main text-center text-xs text-text-muted italic space-y-2 shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
                  <p>All clean! No pending assignments remaining.</p>
                </div>
              )}
            </div>

            {/* Graded Log */}
            {gradedSubs.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border-main/50">
                <h3 className="text-xs font-black text-text-muted uppercase tracking-widest pl-2">
                  Recently Graded ({gradedSubs.length})
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {gradedSubs.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-border-main bg-bg-card/40 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-4">
                        <h4 className="font-bold text-text-main truncate">{sub.assignment?.title}</h4>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Student: <strong className="text-text-main">{sub.student?.full_name}</strong>
                        </p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        Grade: {sub.grade}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Detailed grading desk (7 cols) */}
          <div className="lg:col-span-7">
            {selectedSub ? (
              <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 sm:p-8 space-y-6 shadow-md animate-fade-in">
                <div className="border-b border-border-main/50 pb-4 space-y-1">
                  <span className="text-[9px] font-black uppercase text-primary tracking-widest block">
                    Submission Grading Desk
                  </span>
                  <h2 className="text-lg font-heading font-black text-text-main leading-snug">
                    {selectedSub.assignment?.title}
                  </h2>
                  <p className="text-xs text-text-muted">
                    Student: <strong className="text-text-main">{selectedSub.student?.full_name}</strong> • Completed: {new Date(selectedSub.submitted_at).toLocaleString()}
                  </p>
                </div>

                {/* PDF Viewer Block */}
                {selectedSub.content_link && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-text-muted">
                      <span>Submitted Document Panel</span>
                      {selectedSub.content_file_name && <span className="text-primary truncate max-w-xs">{selectedSub.content_file_name}</span>}
                    </div>
                    <div className="border border-border-main rounded-2xl overflow-hidden bg-bg-main h-[400px]">
                      <iframe
                        src={selectedSub.content_link}
                        className="w-full h-full border-0"
                        title="PDF Submission Viewer"
                      />
                    </div>
                  </div>
                )}

                {/* Additional remarks by student */}
                {selectedSub.content_text && (
                  <div className="p-4 bg-bg-main border border-border-main rounded-xl space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-text-muted block">Student remarks:</span>
                    <p className="text-xs text-text-main leading-relaxed italic">&ldquo;{selectedSub.content_text}&rdquo;</p>
                  </div>
                )}

                {/* Form to submit grade */}
                <form onSubmit={handleGradeSubmit} className="space-y-4 pt-4 border-t border-border-main/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group flex flex-col gap-1">
                      <label htmlFor="grade" className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Assign Score (0-100)</label>
                      <input
                        type="number"
                        id="grade"
                        min="0"
                        max="100"
                        value={grade}
                        onChange={(e) => setGrade(Number(e.target.value))}
                        required
                        className="w-full px-4 py-2 border border-border-main rounded-xl bg-bg-main text-xs text-text-main focus:outline-none focus:border-primary transition-all font-bold"
                      />
                    </div>
                    <div className="form-group flex flex-col justify-end">
                      <p className="text-[10px] text-text-muted leading-relaxed pb-1.5">
                        Minimum passing score is <strong>75%</strong>. Non-passing grades will flag the module as incomplete.
                      </p>
                    </div>
                  </div>

                  <div className="form-group flex flex-col gap-1">
                    <label htmlFor="feedback" className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Evaluation &amp; Feedback Notes</label>
                    <textarea
                      id="feedback"
                      rows={3}
                      placeholder="Add coaching tips, corrections, or encouraging remarks..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full px-4 py-2 border border-border-main rounded-xl bg-bg-main text-xs text-text-main focus:outline-none focus:border-primary transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleRequestResubmission}
                      className="btn border border-error/30 hover:bg-error/5 text-error px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex-1"
                    >
                      Request Resubmission
                    </button>
                    <button
                      type="submit"
                      className="btn bg-primary text-text-inverse hover:brightness-110 px-8 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all flex-1"
                    >
                      Submit Grade &amp; Complete
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-12 text-center bg-bg-card border border-border-main rounded-2xl text-xs text-text-muted italic space-y-2 shadow-sm">
                <FileText className="w-10 h-10 text-text-muted mx-auto opacity-50" />
                <p>Select a student assignment from the queue to start assessing.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Promotions Tab View */
        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
          <div>
            <h3 className="font-heading font-black text-base text-text-main flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-accent" />
              Phase 2 Promotions Desk
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Verify completion of sandbox live streams and promote eligible students into Phase 3 Field Practicals.
            </p>
          </div>

          {phase2Students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-main/50">
              {phase2Students.map((s) => (
                <div
                  key={s.profile.id}
                  className="p-5 rounded-2xl border border-border-main bg-bg-main/30 flex flex-col justify-between space-y-4 hover:border-accent/40 transition-all duration-300"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-text-main">{s.profile.full_name}</h4>
                    <p className="text-[10px] text-text-muted">{s.profile.email}</p>
                    <div className="pt-2 text-[10px] text-text-muted space-y-1">
                      <p>Selected Slot: <strong className="text-text-main">{s.progress.selected_class || "Not Enrolled"}</strong></p>
                      <p>Completed Modules: <strong className="text-text-main">{s.progress.completed_modules.length}</strong></p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePromoteToPhase3(s.profile.id)}
                    className="btn w-full bg-accent text-text-inverse hover:brightness-110 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all"
                  >
                    Promote to Phase 3 Field Practicals
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic py-6 text-center border-t border-border-main/40">
              No students are currently awaiting promotion from Phase 2.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
