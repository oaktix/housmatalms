"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ClipboardList, CheckCircle2, ChevronRight, FileText, ExternalLink, GraduationCap, Award } from "lucide-react";
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
  }, [currentUser, loadData]);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border-main pb-4">
        <h1 className="text-lg font-heading font-bold text-text-main flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          Instructor Assessments
        </h1>
        <div className="flex gap-2 p-1 bg-bg-card border border-border-main rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "assignments" ? "bg-primary text-white" : "text-text-muted hover:text-text-main"
            }`}
          >
            Digital Assignments
          </button>
          <button
            onClick={() => setActiveTab("promotions")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "promotions" ? "bg-accent text-white" : "text-text-muted hover:text-text-main"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Phase 2 Promotions
            {phase2Students.length > 0 && (
              <span className="w-4 h-4 bg-error text-white rounded-full flex items-center justify-center text-[9px]">
                {phase2Students.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "assignments" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Left Column: Submissions Queue List (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Pending Queue */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider pl-2">
                Waiting for Assessment ({pendingSubs.length})
              </h3>
              
              {pendingSubs.length > 0 ? (
                <div className="space-y-2">
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
                          ? "bg-primary-glow border-primary text-text-main"
                          : "bg-bg-card border-border-main text-text-muted hover:text-text-main hover:bg-bg-card-hover"
                      }`}
                    >
                      <div className="space-y-1 pr-4 min-w-0 flex-grow">
                        <h4 className="font-bold text-text-main text-xs truncate">
                          {sub.assignment?.title || "Assignment"}
                        </h4>
                        <p className="text-[10px] text-text-muted">
                          Submitted by: <strong className="text-text-main">{sub.student?.full_name}</strong>
                        </p>
                        <p className="text-[9px] text-text-muted">
                          On: {new Date(sub.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-bg-card border border-border-main text-center text-xs text-text-muted italic">
                  All submissions graded!
                </div>
              )}
            </div>

            {/* Graded History */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider pl-2">
                Graded Submissions History ({gradedSubs.length})
              </h3>
              
              {gradedSubs.length > 0 ? (
                <div className="space-y-2">
                  {gradedSubs.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-bg-card/50 border border-border-main flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1 min-w-0 flex-grow pr-4">
                        <h4 className="font-bold text-text-main truncate">
                          {sub.assignment?.title}
                        </h4>
                        <p className="text-[10px] text-text-muted">
                          Student: <strong>{sub.student?.full_name}</strong>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-extrabold bg-primary-glow border border-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Assign: {sub.grade}/100
                        </span>
                        {sub.finalGrades && (
                          <span className="text-[10px] font-extrabold bg-accent/10 border border-accent/20 text-accent px-2 py-0.5 rounded-full">
                            Final: {sub.finalGrades.finalGrade.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted italic pl-2">No graded history recorded yet.</p>
              )}
            </div>
          </div>

          {/* Right Column: Active Grading Form (7 cols) */}
          <div className="lg:col-span-7">
            {selectedSub ? (
              <div className="premium-card rounded-3xl bg-bg-card/80 backdrop-blur-xl border border-primary/20 p-8 space-y-8 shadow-[0_20px_60px_-15px_rgba(43,108,176,0.15)] animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>
                
                <div className="border-b border-border-main pb-6">
                  <span className="text-[9px] font-extrabold uppercase text-primary tracking-widest block">
                    Active Assessment
                  </span>
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-text-main mt-0.5">
                    {selectedSub.assignment?.title}
                  </h3>
                  <p className="text-[10px] text-text-muted mt-1">
                    Candidate: <strong className="text-text-main">{selectedSub.student?.full_name}</strong> ({selectedSub.student?.email})
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-bg-main border border-border-main rounded-xl">
                      <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider mb-1">Quiz Score (30%)</span>
                      <span className="text-lg font-bold text-text-main">{selectedSub.quizScore.toFixed(0)}%</span>
                    </div>
                    {selectedSub.finalGrades && (
                      <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
                        <span className="text-[10px] text-primary font-bold block uppercase tracking-wider mb-1">Final Module Grade</span>
                        <span className="text-lg font-bold text-primary">{selectedSub.finalGrades.finalGrade.toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Student Submission Content:
                  </span>
                  <div className="p-4 rounded-xl bg-bg-main border border-border-main text-xs sm:text-sm text-text-muted leading-relaxed whitespace-pre-line">
                    {selectedSub.content_text || "No text explanation submitted."}
                  </div>
                </div>

                {selectedSub.content_link && (
                  <div className="p-4 rounded-xl bg-bg-main/50 border border-border-main flex items-center justify-between text-xs font-semibold text-text-muted">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>{selectedSub.content_file_name || "Attachment"}</span>
                    </div>
                    <a
                      href={selectedSub.content_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Download / View
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {!successMsg ? (
                  <form onSubmit={handleGradeSubmit} className="space-y-4 pt-4 border-t border-border-main">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="form-group col-span-1">
                        <label htmlFor="grade" className="text-[10px] font-bold text-text-muted block mb-1">
                          Score (0-100)
                        </label>
                        <input
                          type="number"
                          id="grade"
                          min={0}
                          max={100}
                          value={grade}
                          onChange={(e) => setGrade(Number(e.target.value))}
                          className="w-full p-3 rounded-xl border border-border-main bg-bg-main focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-text-main font-bold"
                          required
                        />
                      </div>
                      <div className="form-group col-span-2">
                        <label htmlFor="feedback" className="text-[10px] font-bold text-text-muted block mb-2">
                          Feedback / Remarks
                        </label>
                        <input
                          type="text"
                          id="feedback"
                          placeholder="Add constructive comments for the student..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="w-full p-3 rounded-xl border border-border-main bg-bg-main focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-text-main"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-xs hover:shadow-[0_10px_20px_-10px_rgba(43,108,176,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                    >
                      Submit Score & Save Assessment
                    </button>
                  </form>
                ) : (
                  <div className="p-8 text-center space-y-3 bg-primary-glow/20 border border-primary/20 rounded-xl animate-fade-in">
                    <CheckCircle2 className="w-8 h-8 text-primary mx-auto animate-bounce" />
                    <h4 className="font-bold text-text-main text-sm">{successMsg}</h4>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-text-muted bg-bg-card border border-border-main rounded-2xl italic">
                Select a student submission from the queue to start grading.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="premium-card rounded-2xl bg-accent-glow/5 border-accent/20 p-8 space-y-2">
            <h2 className="text-lg font-heading font-extrabold text-text-main flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Phase 2 Bootcamp Promotions
            </h2>
            <p className="text-xs text-text-muted max-w-2xl">
              Students listed below have completed Phase 1 and are currently participating in the live Phase 2 Bootcamp. Once you have graded their live practical assignments outside the LMS, click &quot;Promote&quot; to unlock their access to Phase 3 Field Practicals.
            </p>
          </div>

          {phase2Students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {phase2Students.map((student) => (
                <div key={student.profile.id} className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-sm text-text-main">{student.profile.full_name}</h3>
                      <p className="text-[10px] text-text-muted">{student.profile.email}</p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary uppercase tracking-wider">
                      Phase 2 In-Progress
                    </span>
                  </div>

                  <div className="pt-4 border-t border-border-main">
                    <button
                      onClick={() => handlePromoteToPhase3(student.profile.id)}
                      className="w-full py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:brightness-110 transition-all shadow-sm"
                    >
                      Promote to Phase 3
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-text-muted bg-bg-card border border-border-main rounded-2xl">
              <GraduationCap className="w-8 h-8 text-text-muted/50 mx-auto mb-2" />
              <p>No students are currently active in Phase 2.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
