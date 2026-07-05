"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Award,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { StudentProgress, Quiz, QuizQuestion, Assignment } from "@/lib/mockData";
import { phase1Curriculum, hcpaCurriculum, Lesson } from "@/lib/curriculum";
import StudentLayout from "@/components/StudentLayout";

export default function StudentCurriculum() {
  const { currentUser } = useAuth();
  
  // Navigation / Modal States
  const [activeTab, setActiveTab] = useState<"phase1" | "phase2" | "phase3">("phase1");
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<{ lesson: Lesson, moduleId: string, lessonIndex: number } | null>(null);
  
  // Assessment State
  const [activeAssessment, setActiveAssessment] = useState<{ 
    moduleId: string, 
    quiz: Quiz | null, 
    questions: QuizQuestion[], 
    assignment: Assignment | null 
  } | null>(null);
  const [assessmentStatus, setAssessmentStatus] = useState<{ 
    passedQuiz: boolean, 
    submittedAssignment: boolean, 
    isGraded: boolean,
    isRejected?: boolean,
    feedback?: string
  } | null>(null);
  
  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number, passed: boolean, penaltyApplied?: boolean } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Assignment State
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [assignmentText, setAssignmentText] = useState("");
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Curriculum Display State
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>("module-1");

  const loadStudentData = useCallback(() => {
    if (!currentUser) return;
    const studentId = currentUser.id;
    const studentProgress = db.getProgress(studentId);
    setProgress(studentProgress);
  }, [currentUser]);

  useEffect(() => {
    loadStudentData();
    db.sync();
    return db.subscribe(loadStudentData);
  }, [loadStudentData]);

  if (!currentUser || !progress) return null;

  const activeCurriculum = progress.course_id === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;

  // Mark Lesson Read & Auto-advance
  const handleMarkLessonRead = () => {
    if (!selectedLesson || !progress || !currentUser) return;
    const lessonId = `${selectedLesson.moduleId}-lesson-${selectedLesson.lessonIndex}`;
    
    const currentRead = progress.read_lessons || [];
    if (!currentRead.includes(lessonId)) {
      const updatedProgress = {
        ...progress,
        read_lessons: [...currentRead, lessonId]
      };
      db.updateProgress(updatedProgress);
      db.checkAndPromoteModule(currentUser.id, selectedLesson.moduleId);
      setProgress(db.getProgress(currentUser.id));
    }

    const currentModule = activeCurriculum.find(m => m.id === selectedLesson.moduleId);
    const nextLessonIndex = selectedLesson.lessonIndex + 1;

    if (currentModule && nextLessonIndex < currentModule.lessons.length) {
      setSelectedLesson({
        lesson: currentModule.lessons[nextLessonIndex],
        moduleId: selectedLesson.moduleId,
        lessonIndex: nextLessonIndex
      });
    } else {
      setSelectedLesson(null);
    }
  };

  // Select Phase 2 Virtual Class
  const handleSelectClass = (className: string) => {
    if (!progress || !currentUser) return;
    const updated = {
      ...progress,
      selected_class: className
    };
    db.updateProgress(updated);
    setProgress(db.getProgress(currentUser.id));
  };

  // Handle Opening Assessment Modal
  const handleOpenAssessment = (moduleId: string) => {
    if (!currentUser) return;
    
    const quizzes = db.getQuizzes(moduleId);
    const assignments = db.getAssignments(moduleId);
    
    const attempts = db.getQuizAttempts(currentUser.id).filter(a => a.quiz_id === (quizzes[0]?.id || ""));
    const passedQuiz = quizzes.length === 0 || attempts.some(a => a.passed);
    
    const submissions = db.getStudentSubmissions(currentUser.id).filter(s => s.assignment_id === (assignments[0]?.id || ""));
    const submittedAssignment = assignments.length === 0 || submissions.length > 0;
    const isGraded = submissions.some(s => s.status === "graded");
    const isRejected = submissions.some(s => s.status === "rejected");
    const feedback = submissions.length > 0 ? submissions[0].feedback : undefined;
    
    setAssessmentStatus({ passedQuiz, submittedAssignment, isGraded, isRejected, feedback });
    
    setQuizResult(null);
    setQuizAnswers({});
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    
    setAssignmentFile(null);
    setAssignmentText("");
    setSubmissionError(null);
    
    setActiveAssessment({
      moduleId,
      quiz: quizzes[0] || null,
      questions: quizzes.length > 0 ? db.getQuizQuestions(quizzes[0].id) : [],
      assignment: assignments[0] || null
    });
  };

  // Submit Quiz Attempts
  const submitQuiz = async () => {
    if (!currentUser || !activeAssessment || !activeAssessment.quiz) return;
    
    let correctCount = 0;
    activeAssessment.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct_option_index) {
        correctCount++;
      }
    });
    
    const score = (correctCount / activeAssessment.questions.length) * 100;
    const passed = score >= activeAssessment.quiz.passing_score;
    
    try {
      const attempt = await db.createQuizAttempt({
        user_id: currentUser.id,
        quiz_id: activeAssessment.quiz.id,
        score,
        passed
      });
      
      const prevAttempts = db.getQuizAttempts(currentUser.id).filter(a => a.quiz_id === activeAssessment.quiz!.id).length - 1;
      const penaltyFactor = Math.max(0, 1 - (prevAttempts * 0.1));
      const penaltyApplied = penaltyFactor < 1;
      
      setQuizResult({
        score: attempt.score,
        passed: attempt.passed,
        penaltyApplied
      });
      
      if (attempt.passed) {
        setAssessmentStatus((prev) => prev ? { ...prev, passedQuiz: true } : null);
        confetti({ particleCount: 100, spread: 50 });
      }
    } catch (err) {
      alert("Error submitting quiz: " + err);
    }
  };

  // Submit Assignment PDF
  const submitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeAssessment || !activeAssessment.assignment || !assignmentFile) return;
    
    setSubmittingAssignment(true);
    setSubmissionError(null);
    
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        await db.createSubmission({
          user_id: currentUser.id,
          assignment_id: activeAssessment.assignment!.id,
          content_file_name: assignmentFile.name,
          content_link: base64,
          content_text: assignmentText
        });
        
        setSubmittingAssignment(false);
        setAssessmentStatus((prev) => prev ? { ...prev, submittedAssignment: true, isGraded: false, isRejected: false } : null);
        confetti({ particleCount: 120, spread: 60 });
        
        const currentModuleId = activeAssessment.moduleId;
        setTimeout(() => {
          setActiveAssessment(null);
          setAssessmentStatus(null);
          setQuizResult(null);

          const currentModuleIndex = activeCurriculum.findIndex(m => m.id === currentModuleId);
          const nextModule = activeCurriculum[currentModuleIndex + 1];
          if (nextModule) {
            setExpandedModuleId(nextModule.id);
            if (nextModule.lessons.length > 0) {
              setSelectedLesson({ lesson: nextModule.lessons[0], moduleId: nextModule.id, lessonIndex: 0 });
            }
          }
        }, 1800);
      } catch (err) {
        setSubmittingAssignment(false);
        const message = err instanceof Error ? err.message : "Submission failed. Please try again.";
        setSubmissionError(message);
      }
    };
    reader.onerror = () => {
      setSubmittingAssignment(false);
      setSubmissionError("Could not read the selected file. Please try selecting it again.");
    };
    reader.readAsDataURL(assignmentFile);
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Course Path Introduction Hero */}
        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-heading font-extrabold text-text-main flex items-center gap-2">
              Academic Curriculum Timeline
              <Sparkles className="w-5 h-5 text-primary" />
            </h1>
            <p className="text-xs text-text-muted mt-0.5">Read lessons, pass quizzes, and submit assignments to earn certification status.</p>
          </div>
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-primary-glow border border-primary/20 text-primary">
            {progress.completed_modules.length} of {activeCurriculum.length} Modules Completed
          </span>
        </div>

        {/* Phase Tabs */}
        <div className="flex gap-2 border-b border-border-main pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("phase1")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "phase1" ? "bg-primary text-white shadow-sm" : "bg-bg-card border border-border-main text-text-muted hover:text-text-main"
            }`}
          >
            Phase 1: Foundation
          </button>
          <button
            onClick={() => setActiveTab("phase2")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "phase2" ? "bg-secondary text-white shadow-sm" : "bg-bg-card border border-border-main text-text-muted hover:text-text-main"
            }`}
          >
            {progress.current_phase < 2 && <Lock className="w-3.5 h-3.5" />}
            Phase 2: Digital Systems
          </button>
          <button
            onClick={() => setActiveTab("phase3")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "phase3" ? "bg-accent text-white shadow-sm" : "bg-bg-card border border-border-main text-text-muted hover:text-text-main"
            }`}
          >
            {progress.current_phase < 3 && <Lock className="w-3.5 h-3.5" />}
            Phase 3: Field Practicals
          </button>
        </div>

        {/* Phase 1 View */}
        {activeTab === "phase1" && (
          <div className="space-y-8 animate-fade-in relative">
            <div className="relative border-l border-border-main/60 ml-4 sm:ml-8 pl-8 sm:pl-12 space-y-8 py-4">
              {activeCurriculum.map((mod, index) => {
                const isCompleted = progress.completed_modules.includes(mod.id);
                const isUnlocked = index === 0 || progress.completed_modules.includes(activeCurriculum[index - 1].id);
                const isExpanded = expandedModuleId === mod.id;

                return (
                  <div key={mod.id} className="relative group transition-all duration-300">
                    {/* Timeline Node Dot */}
                    <div className={`absolute left-[-45px] sm:left-[-61px] top-4 w-9 h-9 rounded-full border-4 border-bg-main flex items-center justify-center font-bold text-xs transition-all duration-500 z-10 ${
                      isCompleted ? 'bg-primary text-white shadow-[0_0_12px_var(--primary)]' :
                      isUnlocked ? 'bg-bg-card border-primary text-primary shadow-[0_0_8px_rgba(38,196,150,0.2)]' : 'bg-bg-main text-text-muted border-border-main'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                    </div>

                    <div className={`premium-card rounded-2xl border p-5 sm:p-6 space-y-4 transition-all duration-300 overflow-hidden ${
                      isCompleted ? 'bg-primary-glow/5 border-primary/20' : 
                      isUnlocked ? 'bg-bg-card border-border-main hover:border-border-main-hover' : 'bg-bg-main border-border-main/50 opacity-60'
                    }`}>
                      {/* Header Row */}
                      <div 
                        className="flex justify-between items-center cursor-pointer select-none"
                        onClick={() => { if (isUnlocked) setExpandedModuleId(isExpanded ? null : mod.id); }}
                      >
                        <div className="space-y-1">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isCompleted ? 'text-primary' : 'text-text-muted'}`}>
                            Module {index + 1} • {isCompleted ? 'Completed' : isUnlocked ? 'Available' : 'Locked'}
                          </span>
                          <h3 className="font-heading font-bold text-sm sm:text-base text-text-main leading-snug">
                            {mod.title.split(': ')[1] || mod.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
                          {isUnlocked ? (
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full group-hover:brightness-110 transition-all">
                              {isExpanded ? 'Collapse' : 'Expand'}
                            </span>
                          ) : (
                            <Lock className="w-4 h-4 text-text-muted flex-shrink-0" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="pt-4 border-t border-border-main/50 space-y-4 animate-in fade-in duration-300">
                          <p className="text-xs text-text-muted leading-relaxed">
                            <strong className="text-text-main">Objective:</strong> {mod.objective}
                          </p>

                          {/* Lessons Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {mod.lessons.map((lesson, idx) => {
                              const lessonId = `${mod.id}-lesson-${idx}`;
                              const isRead = progress.read_lessons?.includes(lessonId) || false;
                              const prevLessonId = idx > 0 ? `${mod.id}-lesson-${idx - 1}` : null;
                              const isUnlockedLesson = prevLessonId ? progress.read_lessons?.includes(prevLessonId) : true;

                              return (
                                <button
                                  key={idx}
                                  disabled={!isUnlockedLesson}
                                  onClick={() => setSelectedLesson({ lesson, moduleId: mod.id, lessonIndex: idx })}
                                  className={`text-left p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all duration-300 group ${
                                    isRead ? 'bg-primary/5 border-primary/20 text-text-main hover:bg-primary/10' : 
                                    isUnlockedLesson ? 'bg-bg-main border-border-main hover:border-primary/45 hover:bg-bg-card-hover text-text-muted hover:text-text-main shadow-sm' : 
                                    'bg-bg-main border-border-main/30 text-text-muted/40 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <BookOpen className={`w-4 h-4 flex-shrink-0 ${isRead ? 'text-primary' : isUnlockedLesson ? 'text-primary/70 group-hover:text-primary' : 'text-text-muted/40'}`} />
                                    <span className="truncate">{lesson.title}</span>
                                  </div>
                                  {isRead ? (
                                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                  ) : !isUnlockedLesson ? (
                                    <Lock className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 opacity-55 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Assessment Area */}
                          {(() => {
                            const quizzes = db.getQuizzes(mod.id);
                            const assignments = db.getAssignments(mod.id);
                            const hasAssessment = quizzes.length > 0 || assignments.length > 0;
                            
                            if (!isCompleted && isUnlocked) {
                              if (hasAssessment) {
                                return (
                                  <button
                                    onClick={() => handleOpenAssessment(mod.id)}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary hover:to-primary-light hover:text-white border border-primary/30 text-xs font-black text-primary transition-all duration-300 flex items-center justify-center gap-2 group"
                                  >
                                    <Award className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Launch End-of-Module Assessment
                                  </button>
                                );
                              }
                            } else if (isCompleted) {
                              return (
                                <div className="w-full py-2 p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs font-bold text-primary text-center">
                                  Module Completed ✓
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Phase 2: Live Bootcamp View */}
        {activeTab === "phase2" && (
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 md:p-8 space-y-6 animate-fade-in">
            {progress.current_phase < 2 ? (
              <div className="text-center py-12 space-y-4">
                <Lock className="w-12 h-12 text-text-muted mx-auto opacity-60" />
                <h3 className="text-base font-extrabold text-text-main">Phase 2 Digital Bootcamp is Locked</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                  Complete all Phase 1 self-paced modules to unlock Phase 2 Live Stream Bootcamps.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                    Cohort Sandbox
                  </span>
                  <h2 className="text-lg sm:text-xl font-heading font-black text-text-main mt-2">
                    Phase 2 Live Bootcamp &amp; Simulated Sandbox
                  </h2>
                  <p className="text-xs text-text-muted mt-1">
                    Select your scheduled live cohort sandbox sessions. Join live streaming tutorials led by akinwunmi Awoyode.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-main/50">
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-text-main uppercase tracking-wider">Select Class Stream</h3>
                    <div className="space-y-3">
                      {[
                        "Bootcamp Stream - Tuesday July 7th, 2026 (4PM)",
                        "Bootcamp Stream - Tuesday July 14th, 2026 (4PM)",
                        "Bootcamp Stream - Tuesday July 21st, 2026 (4PM)",
                        "Bootcamp Stream - Tuesday July 28th, 2026 (4PM)"
                      ].map((cls) => (
                        <button
                          key={cls}
                          onClick={() => handleSelectClass(cls)}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            progress.selected_class === cls
                              ? "bg-secondary/5 border-secondary text-text-main shadow-md shadow-secondary/10"
                              : "bg-bg-main border-border-main text-text-muted hover:border-secondary/45"
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span>{cls}</span>
                            {progress.selected_class === cls && <CheckCircle2 className="w-4 h-4 text-secondary" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-bg-main border border-border-main flex flex-col justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-text-main">Weekly Simulated Practical Sandbox</p>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        Enrolled students gain access to the simulated landlord database to practice utility ledger logs, tenant verification screenings, and coordinate check overlays.
                      </p>
                    </div>
                    <a
                      href="https://simulator.housmata.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn w-full mt-4 bg-secondary text-white text-xs font-bold py-3 rounded-xl text-center flex items-center justify-center gap-1 hover:brightness-110 shadow-sm"
                    >
                      Access Sandbox Simulator
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 3: Field Practicals View */}
        {activeTab === "phase3" && (
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 md:p-8 space-y-6 animate-fade-in">
            {progress.current_phase < 3 ? (
              <div className="text-center py-12 space-y-4">
                <Lock className="w-12 h-12 text-text-muted mx-auto opacity-60" />
                <h3 className="text-base font-extrabold text-text-main">Phase 3 Field Practicals is Locked</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                  Unlock Phase 3 by completing both self-paced modules and sandbox live assessments.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
                    Field Internship
                  </span>
                  <h2 className="text-lg sm:text-xl font-heading font-black text-text-main mt-2">
                    Phase 3 Field Practicals &amp; Capstone Checks
                  </h2>
                  <p className="text-xs text-text-muted mt-1">
                    Apply your knowledge out on real properties. Perform mapping inspections and upload site reports for verification.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 text-xs text-accent font-bold text-center">
                  You are currently active in Phase 3 Field Practicals. Coordinate with your assigned supervisor.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Lesson Drawer Overlay */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-bg-main/80 backdrop-blur-md z-50 flex items-center justify-end animate-fade-in">
          <div className="w-full max-w-2xl h-full bg-bg-card border-l border-border-main shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-left">
            {/* Header */}
            <div className="p-6 border-b border-border-main flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                  Module Lesson {selectedLesson.lessonIndex + 1}
                </span>
                <h2 className="text-base sm:text-lg font-heading font-bold text-text-main leading-snug">
                  {selectedLesson.lesson.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="p-2 rounded-lg border border-border-main hover:bg-bg-card-hover text-text-muted hover:text-text-main transition-all"
              >
                Close Drawer
              </button>
            </div>

            {/* Reading Content */}
            <div className="flex-grow p-6 sm:p-8 overflow-y-auto space-y-4 text-sm leading-relaxed text-text-main markdown-body">
              {selectedLesson.lesson.content.flatMap((block) => block.split("\n")).map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={idx} className="h-2" />;

                // Horizontal Rule
                if (/^---+$/.test(trimmed) || /^___+$/.test(trimmed)) {
                  return <hr key={idx} className="border-border-main my-6" />;
                }

                // Headers (##, ###, #)
                if (trimmed.startsWith("#")) {
                  // Strip the hash marks, any markdown bold/italic stars, and Lesson prefixes
                  let headerText = trimmed.replace(/^#+\s*/, "").replace(/\*+/g, "").replace(/\*+/g, "");
                  headerText = headerText.replace(/^Lesson\s+\d+:\s*/i, "");
                  
                  return (
                    <h4 key={idx} className="text-base sm:text-lg font-black text-text-main mt-6 mb-3 tracking-tight">
                      {headerText}
                    </h4>
                  );
                }

                // Blockquotes (> )
                if (trimmed.startsWith(">")) {
                  const quoteText = trimmed.replace(/^>\s*/, "").replace(/\[!.*?\]/g, "").replace(/\*+/g, "").trim();
                  if (!quoteText) return null;
                  return (
                    <blockquote key={idx} className="border-l-4 border-primary/50 bg-primary-glow/20 px-4 py-3 rounded-r-xl text-xs text-text-muted my-4 italic leading-relaxed">
                      {quoteText}
                    </blockquote>
                  );
                }

                // Bullet Lists (- or *)
                if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
                  const listText = trimmed.replace(/^[-*]\s*/, "").replace(/\*+/g, "").trim();
                  return (
                    <ul key={idx} className="list-disc pl-5 space-y-1 my-2">
                      <li className="text-xs sm:text-sm text-text-muted leading-relaxed">{listText}</li>
                    </ul>
                  );
                }

                // Standard Paragraph
                // Clean up any remaining markdown stars in the paragraph
                const cleanedText = trimmed.replace(/\*+/g, "");
                return (
                  <p key={idx} className="text-xs sm:text-sm leading-relaxed text-text-main mb-3">
                    {cleanedText}
                  </p>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border-main bg-bg-main/50 flex justify-between items-center gap-4">
              <button
                onClick={() => setSelectedLesson(null)}
                className="btn border border-border-main text-text-muted hover:text-text-main px-6 py-3 rounded-xl text-xs font-bold transition-all"
              >
                Close Lesson
              </button>
              <button
                onClick={handleMarkLessonRead}
                className="btn bg-primary text-text-inverse hover:brightness-110 px-8 py-3 rounded-xl text-xs font-extrabold shadow-md transition-all"
              >
                Mark Read &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Modal Overlay */}
      {activeAssessment && (
        <div className="fixed inset-0 bg-bg-main/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="premium-card rounded-2xl bg-bg-card border-border-main max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex justify-between items-center pb-4 border-b border-border-main/50">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Module End Assessment
                </span>
                <h2 className="text-xl font-heading font-black text-text-main">
                  Verify Competence
                </h2>
              </div>
              <button
                onClick={() => { setActiveAssessment(null); setQuizResult(null); }}
                className="p-1.5 rounded-lg border border-border-main text-text-muted hover:text-text-main transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-6">
              {!assessmentStatus?.passedQuiz && activeAssessment.quiz ? (
                /* Quiz View */
                <div className="space-y-6 animate-fade-in">
                  <div className="p-4 bg-primary-glow/40 border border-primary/20 rounded-xl space-y-1.5">
                    <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">Module Quiz Assessment</h4>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      You must score at least <strong>{activeAssessment.quiz.passing_score}%</strong> to pass this quiz. Each attempt after the first incurs a <strong>10% score penalty</strong>.
                    </p>
                  </div>

                  {quizResult && (
                    <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                      quizResult.passed ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-error/5 border-error/20 text-error'
                    }`}>
                      <p className="font-extrabold text-sm mb-1">{quizResult.passed ? 'Passed ✓' : 'Failed'}</p>
                      <p>Your Score: <strong>{quizResult.score.toFixed(0)}%</strong></p>
                      {quizResult.penaltyApplied && <p className="mt-1 font-bold text-text-muted">A score deduction penalty has been applied for multiple attempts.</p>}
                      {!quizResult.passed && <button onClick={() => { setQuizResult(null); setQuizAnswers({}); setCurrentQuestionIndex(0); setShowExplanation(false); }} className="mt-3 btn bg-error text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">Try Again</button>}
                    </div>
                  )}

                  <div className="space-y-4">
                    {(() => {
                      const q = activeAssessment.questions[currentQuestionIndex];
                      if (!q) return null;
                      const userAns = quizAnswers[q.id];
                      const isCorrect = userAns === q.correct_option_index;

                      return (
                        <div key={q.id} className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-text-muted">
                            <span>Question {currentQuestionIndex + 1} of {activeAssessment.questions.length}</span>
                            <span className="text-primary">Multiple Choice</span>
                          </div>
                          <p className="text-sm font-extrabold text-text-main leading-snug">{q.question}</p>
                          <div className="grid grid-cols-1 gap-3.5 pt-2">
                            {q.options.map((opt, optIdx) => {
                              let optionClass = "border-border-main hover:border-primary/45 hover:bg-bg-card-hover cursor-pointer";
                              if (showExplanation) {
                                optionClass = "opacity-60 cursor-not-allowed";
                                if (optIdx === q.correct_option_index) {
                                  optionClass = "border-primary bg-primary/5 text-primary opacity-100 font-bold";
                                } else if (userAns === optIdx) {
                                  optionClass = "border-error bg-error/5 text-error opacity-100 font-bold";
                                }
                              } else {
                                if (userAns === optIdx) {
                                  optionClass = "border-primary bg-primary/5 text-primary";
                                }
                              }

                              return (
                                <label key={optIdx} className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${optionClass}`}>
                                  <input
                                    type="radio"
                                    name={`question-${q.id}`}
                                    className="mt-1 flex-shrink-0"
                                    checked={userAns === optIdx}
                                    disabled={showExplanation}
                                    onChange={() => {
                                      setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }));
                                      setShowExplanation(true);
                                    }}
                                  />
                                  <span className="text-sm leading-relaxed">{opt}</span>
                                  {showExplanation && optIdx === q.correct_option_index && <span className="ml-auto text-xs uppercase tracking-wider text-primary hidden sm:block">Correct</span>}
                                  {showExplanation && optIdx === userAns && !isCorrect && <span className="ml-auto text-xs uppercase tracking-wider text-error hidden sm:block">Your Answer</span>}
                                </label>
                              );
                            })}
                          </div>

                          {showExplanation && (
                            <div className="pl-2 sm:pl-6 pt-4 animate-fade-in">
                              <div className={`p-5 rounded-xl text-sm leading-relaxed border ${isCorrect ? 'bg-primary/5 border-primary/20 text-text-main' : 'bg-error/5 border-error/20 text-text-main'}`}>
                                <span className="font-extrabold block mb-2">{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                                {q.explanation || `The correct answer is: ${q.options[q.correct_option_index]}`}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="pt-6 border-t border-border-main flex justify-end min-h-[80px]">
                    {showExplanation && (
                      currentQuestionIndex < activeAssessment.questions.length - 1 ? (
                        <button
                          onClick={() => {
                            setCurrentQuestionIndex(prev => prev + 1);
                            setShowExplanation(false);
                          }}
                          className="btn bg-primary text-white border border-primary px-8 py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-sm"
                        >
                          Next Question
                        </button>
                      ) : (
                        <button
                          onClick={submitQuiz}
                          className="btn bg-secondary text-white px-8 py-3 rounded-xl font-bold hover:brightness-110 transition-all"
                        >
                          Finish Quiz
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : assessmentStatus && (!assessmentStatus.submittedAssignment || !assessmentStatus.isGraded) && activeAssessment.assignment ? (
                /* Assignment View */
                <div className="space-y-6 animate-fade-in">
                  {assessmentStatus.isRejected ? (
                    <div className="bg-error/10 border border-error/20 p-4 rounded-xl mb-6">
                      <h4 className="text-error font-bold mb-1">Resubmission Requested by Instructor</h4>
                      <p className="text-xs text-text-muted mb-2">
                        Your previous submission was not accepted. Please read the instructor&apos;s feedback below and upload a revised assignment.
                      </p>
                      {assessmentStatus.feedback && (
                        <div className="p-3 bg-bg-main border border-border-main rounded-lg text-xs font-mono text-text-main">
                          <strong>Feedback:</strong> {assessmentStatus.feedback}
                        </div>
                      )}
                    </div>
                  ) : assessmentStatus.submittedAssignment ? (
                    <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl mb-6">
                      <h4 className="text-warning font-bold mb-1">Resubmission Notice</h4>
                      <p className="text-xs text-text-muted">
                        You have already submitted this assignment, but the instructor has not graded it yet.
                        You can upload a new version below, which will <strong>completely replace</strong> your previous submission.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl mb-6">
                      <h4 className="text-primary font-bold mb-2">Assignment Required</h4>
                      <p className="text-sm text-text-muted">You have passed the quiz. To complete this module, please submit your final assignment.</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-text-main">{activeAssessment.assignment.title}</h3>
                    <p className="text-sm text-text-muted mt-2">{activeAssessment.assignment.description}</p>
                  </div>
                  <form onSubmit={submitAssignment} className="space-y-4 pt-4 border-t border-border-main">
                    <div>
                      <label className="text-xs font-bold block mb-2 text-text-main">Upload Presentation/Slides (PDF Only)</label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative flex flex-col items-center justify-center w-full p-8 rounded-2xl border-2 border-dashed border-primary/30 bg-bg-main/50 hover:bg-bg-main hover:border-primary/50 transition-all duration-300">
                          <input 
                            type="file" 
                            accept=".pdf"
                            required 
                            title="Upload presentation or slides"
                            placeholder="Upload presentation or slides"
                            aria-label="Upload presentation or slides"
                            onChange={e => { setAssignmentFile(e.target.files?.[0] || null); setSubmissionError(null); }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          />
                          {!assignmentFile ? (
                            <div className="text-center space-y-2 pointer-events-none">
                              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                              </div>
                              <p className="text-sm font-bold text-primary">Click to browse or drag and drop</p>
                              <p className="text-xs text-text-muted">PDF up to 20MB</p>
                            </div>
                          ) : (
                            <div className="text-center space-y-2 pointer-events-none">
                              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                              </div>
                              <p className="text-sm font-bold text-accent">{assignmentFile.name}</p>
                              <p className="text-xs text-text-muted">Ready to submit • {(assignmentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1 text-text-main">Additional Remarks (Optional)</label>
                      <textarea 
                        rows={4} 
                        value={assignmentText} 
                        onChange={e => setAssignmentText(e.target.value)} 
                        className="w-full p-3 rounded-xl border border-border-main bg-bg-main text-text-main" 
                        placeholder="Any additional context for the instructor..." 
                      />
                    </div>
                    {submissionError && (
                      <div className="bg-error/10 border border-error/20 text-error text-sm p-3 rounded-xl">
                        {submissionError}
                      </div>
                    )}
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={submittingAssignment}
                        className="btn bg-primary text-white px-8 py-3 rounded-xl font-bold hover:brightness-110 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {submittingAssignment && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {submittingAssignment ? "Processing & Submitting..." : "Submit Assignment"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4 animate-fade-in">
                  <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
                  <h2 className="text-2xl font-bold text-text-main">Assessment Completed</h2>
                  <p className="text-text-muted max-w-sm mx-auto">You have successfully passed the quiz and submitted your assignment. The module is now marked as complete and the instructor will grade your assignment soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}
