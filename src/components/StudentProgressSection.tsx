"use client";

import React, { useEffect, useRef } from "react";
import { BookOpen, CheckCircle2, Award, Clock, HelpCircle, Lock, X, Zap } from "lucide-react";
import { db } from "@/lib/db";
import { phase1Curriculum, hcpaCurriculum } from "@/lib/curriculum";

interface StudentProgressSectionProps {
  studentId: string;
}

export default function StudentProgressSection({ studentId }: StudentProgressSectionProps) {
  const progress = db.getProgress(studentId);
  const activeCurriculum = progress.course_id === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;
  const completedCount = progress.completed_modules.length;
  const totalModulesCount = activeCurriculum.length;
  const readLessons = progress.read_lessons || [];

  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${(completedCount / totalModulesCount) * 100}%`;
    }
  }, [completedCount, totalModulesCount]);

  return (
    <div className="space-y-6">
      {/* Phase Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-bg-main border border-border-main rounded-2xl space-y-1">
          <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Current Training Phase</span>
          <span className="font-heading font-black text-sm text-text-main flex items-center gap-1.5">
            {progress.current_phase === 1 && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                Phase 1: Foundation
              </>
            )}
            {progress.current_phase === 2 && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                Phase 2: Digital Systems
              </>
            )}
            {progress.current_phase === 3 && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                Phase 3: Field Practicals
              </>
            )}
            {progress.current_phase === 4 && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                Phase 4: Certified Graduate
              </>
            )}
          </span>
        </div>
<div className="p-4 bg-bg-main border border-border-main rounded-2xl space-y-1">
            <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Phase 2 Status</span>
            <span className="font-heading font-black text-sm text-text-main uppercase tracking-wide">
              {progress.phase2_status === "locked" && <span className="text-text-muted flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>}
              {progress.phase2_status === "in-progress" && <span className="text-warning flex items-center gap-1"><Zap className="w-3 h-3" /> In Progress</span>}
              {progress.phase2_status === "passed" && <span className="text-primary flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Passed</span>}
              {progress.phase2_status === "failed" && <span className="text-error flex items-center gap-1"><X className="w-3 h-3" /> Failed</span>}
            </span>
          </div>
      </div>

      {/* Progress Bar Header */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-text-muted uppercase tracking-wider">Phase 1 Modules Completed</span>
          <span className="text-primary bg-primary/10 px-2.5 py-0.5 rounded-full text-[10px] font-black">
            {completedCount} / {totalModulesCount} Modules
          </span>
        </div>
        <div className="w-full bg-bg-main h-2.5 rounded-full overflow-hidden border border-border-main">
          <div
            ref={progressBarRef}
            className="bg-primary h-full transition-all duration-500 rounded-full"
          />
        </div>
      </div>

      {/* Modules List Accordion/Grid */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest pl-1">
          Curriculum Completion Details
        </h4>
        <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
          {activeCurriculum.map((mod, idx) => {
            const isCompleted = progress.completed_modules.includes(mod.id);
            const totalLessons = mod.lessons.length;
            const readCount = mod.lessons.reduce(
              (acc, _, lIdx) => acc + (readLessons.includes(`${mod.id}-lesson-${lIdx}`) ? 1 : 0),
              0
            );

            const quizzes = db.getQuizzes(mod.id);
            const assignments = db.getAssignments(mod.id);
            const hasQuiz = quizzes.length > 0;
            const hasAssignment = assignments.length > 0;

            let quizText = "";
            let quizPassed = false;
            let quizScore = 0;
            if (hasQuiz) {
              const attempts = db.getQuizAttempts(studentId).filter((a) => a.quiz_id === quizzes[0].id);
              if (attempts.length > 0) {
                quizScore = Math.max(...attempts.map((a) => a.score));
                quizPassed = attempts.some((a) => a.passed);
                quizText = `Quiz: ${quizScore.toFixed(0)}%`;
              } else {
                quizText = "Quiz: Not Attempted";
              }
            }

            let assignText = "";
            let assignStatus: "none" | "pending" | "graded" = "none";
            let assignGrade = 0;
            if (hasAssignment) {
              const submissions = db.getStudentSubmissions(studentId).filter((s) => s.assignment_id === assignments[0].id);
              if (submissions.length > 0) {
                const sub = submissions[0];
                if (sub.status === "graded") {
                  assignGrade = sub.grade || 0;
                  assignText = `Assign: ${assignGrade}/100`;
                  assignStatus = "graded";
                } else {
                  assignText = "Assign: Pending Grade";
                  assignStatus = "pending";
                }
              } else {
                assignText = "Assign: Not Submitted";
              }
            }

            return (
              <div
                key={mod.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isCompleted
                    ? "bg-primary-glow/5 border-primary/20 text-text-main"
                    : "bg-bg-card border-border-main text-text-muted"
                }`}
              >
                <div className="space-y-1.5 min-w-0 flex-grow">
                  <div className="font-bold text-xs text-text-main flex items-center gap-2">
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-black ${
                      isCompleted ? "bg-primary/10 text-primary" : "bg-bg-main text-text-muted"
                    }`}>
                      M{idx + 1}
                    </span>
                    <span className="truncate">{mod.title.split(": ")[1] || mod.title}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-[10px] text-text-muted flex-wrap">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-text-muted" />
                      {readCount}/{totalLessons} Read
                    </span>
                    {hasQuiz && (
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold flex items-center gap-1 ${
                        quizPassed
                          ? "bg-primary/5 border-primary/20 text-primary"
                          : quizScore > 0
                          ? "bg-error/5 border-error/20 text-error"
                          : "bg-bg-main border-border-main text-text-muted"
                      }`}>
                        <HelpCircle className="w-3 h-3" />
                        {quizText}
                      </span>
                    )}
                    {hasAssignment && (
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold flex items-center gap-1 ${
                        assignStatus === "graded"
                          ? "bg-secondary/5 border-secondary/20 text-secondary"
                          : assignStatus === "pending"
                          ? "bg-warning/5 border-warning/20 text-warning"
                          : "bg-bg-main border-border-main text-text-muted"
                      }`}>
                        <Award className="w-3 h-3" />
                        {assignText}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Clock className="w-5 h-5 text-text-muted/60" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
