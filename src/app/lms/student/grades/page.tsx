"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Award,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { StudentProgress, Submission, QuizAttempt } from "@/lib/mockData";
import { phase1Curriculum, hcpaCurriculum } from "@/lib/curriculum";
import StudentLayout from "@/components/StudentLayout";
import { useToast } from "@/components/ui/Toast";

export default function StudentGrades() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const loadStudentData = useCallback(() => {
    if (!currentUser) return;
    const studentId = currentUser.id;
    setProgress(db.getProgress(studentId));
    setSubmissions(db.getStudentSubmissions(studentId));
    setAttempts(db.getQuizAttempts(studentId));
  }, [currentUser]);

  useEffect(() => {
    loadStudentData();
    db.sync();
    return db.subscribe(loadStudentData);
  }, [loadStudentData]);

  if (!currentUser || !progress) return null;

  const activeCurriculum = progress.course_id === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;

  // Calculate overall performance summary
  const gradedModules = activeCurriculum.filter(mod => {
    const grades = db.getFinalModuleGrade(currentUser.id, mod.id);
    return grades !== null;
  });

  const overallScore = gradedModules.length > 0
    ? gradedModules.reduce((acc, mod) => {
        const grades = db.getFinalModuleGrade(currentUser.id, mod.id);
        return acc + (grades ? grades.finalGrade : 0);
      }, 0) / gradedModules.length
    : 0;

  const handleAiInsight = async () => {
    if (!currentUser || !progress) return;
    setAiLoading(true);
    setAiInsight("");
    const moduleData = activeCurriculum.map((mod) => {
      const grades = db.getFinalModuleGrade(currentUser.id, mod.id);
      const modSubs = submissions.filter((s) => {
        const assignments = db.getAssignments(mod.id);
        return assignments.length > 0 && s.assignment_id === assignments[0].id;
      });
      return {
        title: mod.title,
        quizScore: grades?.quizScore,
        assignmentGrade: grades?.assignmentGrade,
        finalGrade: grades?.finalGrade,
        feedback: modSubs[0]?.feedback || undefined,
      };
    });
    try {
      const res = await fetch("/api/ai/performance-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overallScore: Math.round(overallScore),
          phase: progress.current_phase,
          modules: moduleData,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setAiInsight(data.result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast(`AI insight failed: ${msg}`, "error");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header summary card */}
        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-xl font-heading font-extrabold text-text-main flex items-center gap-2">
              Grades &amp; Feedback Panel
              <Award className="w-5 h-5 text-primary animate-pulse" />
            </h1>
            <p className="text-xs text-text-muted">Review your end-of-module weighted scorecards and instructor feedback notes.</p>
          </div>

          <div className="flex gap-6">
            <div className="text-center p-3 px-6 rounded-xl bg-bg-main border border-border-main">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">Graded Modules</span>
              <span className="text-lg font-black text-primary block mt-0.5">{gradedModules.length} / {activeCurriculum.length}</span>
            </div>
            <div className="text-center p-3 px-6 rounded-xl bg-bg-main border border-border-main">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">Overall Avg (Weighted)</span>
              <span className="text-lg font-black text-secondary block mt-0.5">{overallScore.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* AI Performance Insight */}
        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Performance Insight
            </h3>
            <button
              type="button"
              onClick={handleAiInsight}
              disabled={aiLoading}
              className="btn border border-primary/30 hover:bg-primary/5 text-primary px-3 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...
                </>
              ) : (
                "Get my insight"
              )}
            </button>
          </div>
          {aiInsight ? (
            <p className="text-xs text-text-main leading-relaxed whitespace-pre-line">{aiInsight}</p>
          ) : (
            <p className="text-[11px] text-text-muted leading-relaxed">
              Get a personalized, encouraging read on your scorecard — what you&apos;re doing well and where to focus next.
            </p>
          )}
        </div>

        {/* Detailed Modules Performance List */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-text-main uppercase tracking-wider pl-1">
            Module-by-Module Grade Details (30% Quiz / 70% Assignment)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeCurriculum.map((mod, index) => {
              const isCompleted = progress.completed_modules.includes(mod.id);
              const grades = db.getFinalModuleGrade(currentUser.id, mod.id);
              const modSubmissions = submissions.filter(s => {
                const assignments = db.getAssignments(mod.id);
                return assignments.length > 0 && s.assignment_id === assignments[0].id;
              });
              const modAttempts = attempts.filter(a => {
                const quizzes = db.getQuizzes(mod.id);
                return quizzes.length > 0 && a.quiz_id === quizzes[0].id;
              });

              return (
                <div 
                  key={mod.id} 
                  className={`premium-card rounded-2xl border p-5 sm:p-6 space-y-4 flex flex-col justify-between transition-all duration-300 ${
                    grades ? 'bg-primary-glow/5 border-primary/20' : 'bg-bg-card border-border-main'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                        Module {index + 1}
                      </span>
                      {grades ? (
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-primary-glow border border-primary/20 text-primary rounded-full">
                          Graded
                        </span>
                      ) : isCompleted ? (
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Awaiting Grade
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-bg-main border border-border-main text-text-muted rounded-full">
                          Incomplete
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-text-main leading-snug">
                      {mod.title.split(': ')[1] || mod.title}
                    </h4>

                    {grades ? (
                      <div className="space-y-2 pt-2 border-t border-border-main/50 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-text-muted">Quiz Attempt Score (30%)</span>
                          <span className="font-bold text-text-main">{grades.quizScore.toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-muted">Assignment File Grade (70%)</span>
                          <span className="font-bold text-text-main">{grades.assignmentGrade.toFixed(0)}%</span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-border-main flex justify-between items-center text-xs font-black">
                          <span className="text-primary">Weighted Module Total</span>
                          <span className="text-primary">{grades.finalGrade.toFixed(0)}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-border-main/40 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-text-muted">Quiz Attempts Made:</span>
                          <span className="font-bold text-text-main">{modAttempts.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-muted">Assignment Status:</span>
                          <span className="font-bold text-text-main">
                            {modSubmissions.length > 0 ? (
                              modSubmissions[0].status === "rejected" ? (
                                <span className="text-error font-extrabold">Needs Resubmission</span>
                              ) : "Submitted"
                            ) : "Not Submitted"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feedback Box */}
                  {modSubmissions.length > 0 && modSubmissions[0].feedback && (
                    <div className="p-3 bg-bg-main/60 border border-border-main rounded-xl space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-text-muted block">Instructor Feedback:</span>
                      <p className="text-[11px] text-text-main leading-relaxed italic">&ldquo;{modSubmissions[0].feedback}&rdquo;</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
