"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
  Award,
  Megaphone
} from "lucide-react";
import confetti from "canvas-confetti";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Cohort, StudentProgress, Meeting, Quiz, QuizQuestion, Assignment, Announcement } from "@/lib/mockData";
import { phase1Curriculum, Lesson } from "@/lib/curriculum";

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  
  // States
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Navigation / Modal States
  const [activeTab, setActiveTab] = useState<"phase1" | "phase2" | "phase3">("phase1");
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

  // Load Data
  const loadStudentData = useCallback(() => {
    if (!currentUser) return;
    const studentId = currentUser.id;

    // Proactively heal/promote modules where progress criteria are fully met
    phase1Curriculum.forEach((mod) => {
      db.checkAndPromoteModule(studentId, mod.id);
    });

    const studentCohort = db.getStudentCohort(studentId);
    setCohort(studentCohort || null);

    const studentProgress = db.getProgress(studentId);
    setProgress(studentProgress);

    if (studentCohort) {
      setMeetings(db.getMeetings(studentCohort.id));
    }
    
    setAnnouncements(db.getAnnouncements(studentCohort?.id || ""));
  }, [currentUser]);

  useEffect(() => {
    loadStudentData();
    db.sync();
    return db.subscribe(loadStudentData);
  }, [loadStudentData]);

  // Mark Lesson Read
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
    setSelectedLesson(null);
  };

  // Handle Opening Assessment Modal
  const handleOpenAssessment = (moduleId: string) => {
    if (!currentUser) return;
    
    const quizzes = db.getQuizzes(moduleId);
    const assignments = db.getAssignments(moduleId);
    
    let q = null;
    let qs: QuizQuestion[] = [];
    if (quizzes.length > 0) {
      q = quizzes[0];
      qs = db.getQuizQuestions(q.id);
    }
    
    const a = assignments.length > 0 ? assignments[0] : null;
    
    setActiveAssessment({ moduleId, quiz: q, questions: qs, assignment: a });
    
    const attempts = q ? db.getQuizAttempts(currentUser.id).filter(att => att.quiz_id === q!.id) : [];
    const passedQuiz = q ? attempts.some(att => att.passed) : true;
    const studentSubmissions = a ? db.getStudentSubmissions(currentUser.id).filter(s => s.assignment_id === a.id) : [];
    const isGraded = studentSubmissions.some(s => s.status === "graded");
    const isRejected = studentSubmissions.some(s => s.status === "rejected");
    const submittedAssignment = a ? studentSubmissions.length > 0 : true;
    const feedback = studentSubmissions.length > 0 ? (studentSubmissions[0].feedback || "") : "";
    
    setAssessmentStatus({ passedQuiz, submittedAssignment, isGraded, isRejected, feedback });
    setQuizAnswers({});
    setQuizResult(null);
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    setAssignmentFile(null);
    setAssignmentText("");
  };

  const submitQuiz = () => {
    if (!activeAssessment?.quiz || !currentUser) return;
    const { quiz, questions } = activeAssessment;
    
    let correctCount = 0;
    questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct_option_index) {
        correctCount++;
      }
    });

    const rawScore = (correctCount / questions.length) * 100;
    
    const attempt = db.createQuizAttempt({
      quiz_id: quiz.id,
      user_id: currentUser.id,
      score: rawScore,
      passed: false, // passed gets computed inside db.ts with penalty
    });

    setQuizResult({ score: attempt.score, passed: attempt.passed, penaltyApplied: attempt.score < rawScore });
    
    if (attempt.passed) {
      setAssessmentStatus(prev => prev ? { ...prev, passedQuiz: true } : null);
      loadStudentData();
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    } else {
      loadStudentData();
    }
  };

  const submitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessment?.assignment || !currentUser || !assignmentFile) return;
    
    const assignmentId = activeAssessment.assignment.id;
    const userId = currentUser.id;
    const fileName = assignmentFile.name;
    const text = assignmentText;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileDataUrl = event.target?.result as string;

      db.createSubmission({
        assignment_id: assignmentId,
        user_id: userId,
        content_link: fileDataUrl,
        content_file_name: fileName,
        content_text: text
      });
      
      setAssessmentStatus(prev => prev ? { ...prev, submittedAssignment: true, isGraded: false } : null);
      loadStudentData();
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } });
    };
    reader.readAsDataURL(assignmentFile);
  };

  if (!currentUser || !progress) {return null;}

  return (
    <>
      <div className="space-y-6 animate-fade-in">
      {/* 1. Gateway Welcome & Phase Tracker */}
      <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-text-main flex items-center gap-2">
            Welcome back, {currentUser?.full_name}!
            <Sparkles className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-text-muted text-xs">
            Assigned Cohort: <span className="font-bold text-text-main">{cohort ? cohort.name : "Unassigned"}</span>
          </p>
        </div>

        {/* Phase Progress Indicators */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2">
          {/* Phase 1 */}
          <button 
            type="button"
            onClick={() => setActiveTab("phase1")}
            className="flex flex-col items-center gap-1.5 min-w-[80px] cursor-pointer hover:scale-105 transition-transform"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              progress.current_phase >= 1 ? 'bg-primary text-white shadow-[0_0_15px_rgba(38,196,150,0.4)]' : 'bg-bg-main border border-border-main text-text-muted'
            }`}>
              1
            </div>
            <span className={`text-[9px] uppercase tracking-wider font-bold ${progress.current_phase >= 1 ? 'text-primary' : 'text-text-muted'}`}>Foundation</span>
          </button>
          <div className={`h-1 w-8 sm:w-12 rounded-full ${progress.current_phase >= 2 ? 'bg-primary' : 'bg-border-main'}`} />
          
          {/* Phase 2 */}
          <button 
            type="button"
            disabled={progress.current_phase < 2}
            onClick={() => { if (progress.current_phase >= 2) setActiveTab("phase2"); }}
            className={`flex flex-col items-center gap-1.5 min-w-[80px] ${progress.current_phase >= 2 ? 'cursor-pointer hover:scale-105 transition-transform' : 'cursor-not-allowed'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              progress.current_phase >= 2 ? 'bg-secondary text-white shadow-[0_0_15px_rgba(43,108,176,0.4)]' : 'bg-bg-main border border-border-main text-text-muted'
            }`}>
              2
            </div>
            <span className={`text-[9px] uppercase tracking-wider font-bold ${progress.current_phase >= 2 ? 'text-secondary' : 'text-text-muted'}`}>Bootcamp</span>
          </button>
          <div className={`h-1 w-8 sm:w-12 rounded-full ${progress.current_phase >= 3 ? 'bg-accent' : 'bg-border-main'}`} />

          {/* Phase 3 */}
          <button 
            type="button"
            disabled={progress.current_phase < 3}
            onClick={() => { if (progress.current_phase >= 3) setActiveTab("phase3"); }}
            className={`flex flex-col items-center gap-1.5 min-w-[80px] ${progress.current_phase >= 3 ? 'cursor-pointer hover:scale-105 transition-transform' : 'cursor-not-allowed'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              progress.current_phase >= 3 ? 'bg-accent text-white shadow-[0_0_15px_rgba(246,173,85,0.4)]' : 'bg-bg-main border border-border-main text-text-muted'
            }`}>
              3
            </div>
            <span className={`text-[9px] uppercase tracking-wider font-bold ${progress.current_phase >= 3 ? 'text-accent' : 'text-text-muted'}`}>Practicals</span>
          </button>
        </div>
      </div>

      {/* Announcements Widget */}
      {announcements.length > 0 && (
        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 border-b border-border-main pb-2">
            <Megaphone className="w-4 h-4 text-primary animate-pulse" />
            Latest Announcements & Academy Broadcasts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
            {announcements.slice().reverse().map((ann) => (
              <div key={ann.id} className="p-4 rounded-xl border border-border-main bg-bg-main/40 space-y-2 hover:border-primary/30 transition-all duration-300">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="font-bold text-xs text-text-main leading-snug">{ann.title}</h4>
                  <span className="text-[9px] text-text-muted flex-shrink-0 bg-bg-card border border-border-main px-2 py-0.5 rounded-full">
                    {new Date(ann.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed whitespace-pre-wrap">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-heading font-extrabold text-text-main">Foundation Curriculum</h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-bg-main border border-border-main text-text-muted">
              {progress.completed_modules.length} / {phase1Curriculum.length} Modules Completed
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phase1Curriculum.map((mod, index) => {
              const isCompleted = progress.completed_modules.includes(mod.id);
              const isUnlocked = index === 0 || progress.completed_modules.includes(phase1Curriculum[index - 1].id);
              
              return (
                <div key={mod.id} className={`premium-card rounded-2xl border p-6 space-y-4 transition-all relative overflow-hidden ${isCompleted ? 'bg-primary-glow/5 border-primary/30' : isUnlocked ? 'bg-bg-card border-border-main' : 'bg-bg-main border-border-main/50 opacity-70'}`}>
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-bg-main/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                      <div className="bg-bg-card p-3 rounded-full border border-border-main shadow-lg mb-2">
                        <Lock className="w-6 h-6 text-text-muted" />
                      </div>
                      <span className="text-xs font-bold text-text-muted bg-bg-card px-3 py-1 rounded-full border border-border-main">Locked</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isCompleted ? 'text-primary' : 'text-text-muted'}`}>
                      Module {index + 1}
                    </span>
                    {isCompleted && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </div>
                  <h3 className="font-heading font-bold text-sm sm:text-base text-text-main leading-snug">
                    {mod.title.split(': ')[1] || mod.title}
                  </h3>
                  <p className="text-xs text-text-muted line-clamp-2">
                    {mod.objective}
                  </p>

                  <div className="pt-4 border-t border-border-main/50 space-y-2">
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
                          className={`w-full text-left p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all group ${
                            isRead ? 'bg-primary/5 border-primary/20 text-text-main' : 
                            isUnlockedLesson ? 'bg-bg-main border-border-main hover:border-primary/40 hover:bg-bg-card-hover text-text-muted hover:text-text-main' : 
                            'bg-bg-main border-border-main/30 text-text-muted/40 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <BookOpen className={`w-3.5 h-3.5 flex-shrink-0 ${isRead ? 'text-primary' : isUnlockedLesson ? 'text-primary/70 group-hover:text-primary' : 'text-text-muted/40'}`} />
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          {isRead ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          ) : !isUnlockedLesson ? (
                            <Lock className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {(() => {
                    const quizzes = db.getQuizzes(mod.id);
                    const assignments = db.getAssignments(mod.id);
                    const hasAssessment = quizzes.length > 0 || assignments.length > 0;
                    
                    const allLessonsRead = mod.lessons.every((_, idx) => progress.read_lessons?.includes(`${mod.id}-lesson-${idx}`));
                    
                    if (!isCompleted && isUnlocked) {
                      if (hasAssessment) {
                        if (allLessonsRead) {
                          return (
                            <button
                              onClick={() => handleOpenAssessment(mod.id)}
                              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary hover:to-primary-light hover:text-white border border-primary/30 text-xs font-bold text-primary transition-all duration-300 hover:shadow-[0_0_20px_rgba(43,108,176,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                            >
                              <Award className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              End of Module Assessment
                            </button>
                          );
                        } else {
                          return (
                            <button disabled className="w-full mt-2 py-2.5 rounded-xl border border-border-main bg-bg-main text-text-muted/50 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-not-allowed">
                              <Lock className="w-4 h-4" />
                              Complete Lessons to Unlock Assessment
                            </button>
                          );
                        }
                      } else {
                        return (
                          <div className="w-full mt-2 py-2 p-3 rounded-xl border border-border-main bg-bg-main text-xs font-semibold text-text-muted text-center">
                            Read all lessons to complete this module.
                          </div>
                        );
                      }
                    } else if (isCompleted) {
                      if (hasAssessment) {
                        const grades = db.getFinalModuleGrade(currentUser.id, mod.id);
                        if (grades) {
                          return (
                            <div className="w-full mt-2 p-3 rounded-xl border border-border-main bg-bg-main space-y-2">
                              <h4 className="text-[10px] font-extrabold uppercase text-text-muted tracking-widest text-center">Final Grades</h4>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-text-muted">Quiz (30%)</span>
                                <span className="font-bold text-text-main">{grades.quizScore.toFixed(0)}%</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-text-muted">Assignment (70%)</span>
                                <span className="font-bold text-text-main">{grades.assignmentGrade.toFixed(0)}%</span>
                              </div>
                              <div className="pt-2 mt-2 border-t border-border-main flex justify-between items-center text-xs font-bold">
                                <span className="text-primary">Module Score</span>
                                <span className="text-primary">{grades.finalGrade.toFixed(0)}%</span>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="w-full mt-2 space-y-2">
                              <div className="py-2 p-3 rounded-xl border border-border-main bg-bg-main text-xs font-semibold text-text-muted text-center">
                                Module Completed. Awaiting assignment grading.
                              </div>
                              <button
                                onClick={() => handleOpenAssessment(mod.id)}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary hover:to-primary-light hover:text-white border border-primary/30 text-xs font-bold text-primary transition-all duration-300 flex items-center justify-center gap-2 group"
                              >
                                <Award className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                View or Resubmit Assessment
                              </button>
                            </div>
                          );
                        }
                      } else {
                        return (
                          <div className="w-full mt-2 py-2 p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs font-semibold text-primary text-center">
                            Module Completed ✓
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Phase 2 View */}
      {activeTab === "phase2" && (
        <div className="space-y-6">
          {progress.current_phase < 2 ? (
            <div className="premium-card rounded-2xl bg-bg-card border-border-main p-12 text-center space-y-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-bg-main border border-border-main flex items-center justify-center">
                <Lock className="w-8 h-8 text-text-muted" />
              </div>
              <h2 className="text-xl font-heading font-extrabold text-text-main">Phase 2 is Locked</h2>
              <p className="text-sm text-text-muted max-w-md">
                You must complete all {phase1Curriculum.length} modules in Phase 1 to unlock the Phase 2 Digital Systems Bootcamp.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-6">
                <div className="premium-card rounded-2xl bg-secondary-glow/10 border-secondary/30 p-8 space-y-4">
                  <h2 className="text-xl font-heading font-extrabold text-text-main text-secondary">
                    Welcome to Phase 2: Bootcamp
                  </h2>
                  <p className="text-sm text-text-muted leading-relaxed">
                    You have advanced to the Digital Property Management Systems phase. This phase consists of virtual live classes and direct assignments from your Instructor. 
                  </p>
                  <div className="p-4 bg-bg-card rounded-xl border border-border-main text-xs space-y-2 mt-4">
                    <span className="font-bold text-text-main block">Progression Status:</span>
                    <p className="text-text-muted">
                      Your status is currently <strong className="text-warning uppercase">{progress.phase2_status}</strong>. 
                      Once you complete the live assignments, your Instructor will grade you and promote you to Phase 3.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-4 space-y-6">
                <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4">
                  <h2 className="text-sm font-heading font-bold text-text-main flex items-center gap-2 border-b border-border-main pb-2">
                    <Calendar className="w-4 h-4 text-secondary" />
                    Upcoming Live Classes
                  </h2>
                  {meetings.length > 0 ? (
                    <div className="space-y-3">
                      {meetings.map((meet) => (
                        <div key={meet.id} className="p-4 rounded-xl bg-bg-main border border-border-main space-y-2.5">
                          <h4 className="font-heading font-bold text-xs text-text-main">{meet.topic}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(meet.scheduled_at).toLocaleString()}</span>
                          </div>
                          <a href={meet.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-secondary hover:underline pt-1">
                            Join Live Session <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted italic py-4 text-center">No live classes scheduled.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phase 3 View */}
      {activeTab === "phase3" && (
        <div className="space-y-6">
          {progress.current_phase < 3 ? (
            <div className="premium-card rounded-2xl bg-bg-card border-border-main p-12 text-center space-y-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-bg-main border border-border-main flex items-center justify-center">
                <Lock className="w-8 h-8 text-text-muted" />
              </div>
              <h2 className="text-xl font-heading font-extrabold text-text-main">Phase 3 is Locked</h2>
              <p className="text-sm text-text-muted max-w-md">
                You must complete Phase 2 and be promoted by your Instructor to unlock Field Practicals.
              </p>
            </div>
          ) : (
            <div className="premium-card rounded-2xl bg-accent-glow/10 border-accent/30 p-12 text-center space-y-6 flex flex-col items-center justify-center animate-slide-up">
              <div className="w-24 h-24 rounded-full bg-accent text-white flex items-center justify-center shadow-[0_0_40px_rgba(246,173,85,0.5)]">
                <Award className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-heading font-extrabold text-text-main">
                  Congratulations!
                </h2>
                <h3 className="text-xl font-bold text-accent">
                  You have been promoted to Phase 3
                </h3>
              </div>
              <p className="text-sm text-text-muted max-w-lg mx-auto leading-relaxed">
                You are now ready for Real World Execution Training. In this phase, you will transition from a learner to an operator by completing property sourcing exercises, live inspections, and listing uploads directly on Housmata.
              </p>
            </div>
          )}
        </div>
      )}

      </div>

      {/* Lesson Reader Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-bg-card border border-border-main rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-border-main flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-extrabold uppercase text-primary tracking-widest">
                  Course Material
                </span>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-text-main">
                  {selectedLesson.lesson.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="p-1.5 rounded-lg border border-border-main hover:bg-bg-card-hover text-text-muted hover:text-text-main transition-colors text-xs font-bold"
              >
                Close
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              {selectedLesson.lesson.content.map((paragraph, idx) => {
                const parts = paragraph.split('\n');
                return (
                  <div key={idx} className="space-y-2">
                    {parts.length > 1 ? (
                      <>
                        <h4 className="font-bold text-text-main text-xs uppercase tracking-wider">{parts[0]}</h4>
                        <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
                          {parts.slice(1).join('\n')}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
                        {paragraph}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-border-main bg-bg-main/55 flex justify-end">
              <button
                onClick={handleMarkLessonRead}
                className="btn bg-primary text-white hover:brightness-110 px-5 py-2.5 rounded-xl text-xs font-bold"
              >
                Mark as Read & Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Assessment Modal */}
      {activeAssessment && assessmentStatus && (
        <div className="fixed inset-0 z-50 bg-bg-main/60 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto transition-all animate-fade-in">
          <div className="w-full max-w-3xl bg-bg-card/95 backdrop-blur-3xl border border-white/10 dark:border-white/5 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col my-auto animate-slide-up overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-bg-card to-bg-card/80 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-text-main">
                    Module Assessment
                  </h3>
                  <p className="text-xs text-text-muted">Complete both quiz and assignment to unlock the next module.</p>
                </div>
              </div>
              <button
                onClick={() => { setActiveAssessment(null); setAssessmentStatus(null); setQuizResult(null); }}
                className="p-2 rounded-xl border border-border-main hover:bg-bg-card-hover text-text-muted transition-colors text-xs font-bold"
              >
                Close
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {quizResult ? (
                <div className="space-y-8 animate-fade-in">
                  <div className="text-center space-y-6 py-4 border-b border-border-main pb-8">
                    <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center border-4 ${quizResult.passed ? 'border-primary text-primary bg-primary/10' : 'border-error text-error bg-error/10'}`}>
                      <span className="text-2xl font-extrabold">{quizResult.score.toFixed(0)}%</span>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-heading font-extrabold text-text-main">
                        {quizResult.passed ? "Congratulations!" : "Keep Trying!"}
                      </h2>
                      <p className="text-text-muted">
                        {quizResult.passed 
                          ? "You have passed the quiz! You can now proceed to the assignment." 
                          : "You did not meet the required passing score. Please review the material and try again."}
                      </p>
                      {quizResult.penaltyApplied && (
                        <p className="text-xs text-warning mt-2 font-bold bg-warning/10 border border-warning/20 inline-block px-3 py-1 rounded-full">
                          Note: A penalty was applied to your score due to multiple attempts.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-8 pt-4">
                    <h3 className="font-heading font-bold text-lg text-text-main">Review Your Answers</h3>
                    {activeAssessment.questions.map((q, idx) => {
                      const userAns = quizAnswers[q.id];
                      const isCorrect = userAns === q.correct_option_index;
                      return (
                        <div key={q.id} className="space-y-4 p-4 rounded-xl border border-border-main bg-bg-card shadow-sm">
                          <h4 className="font-bold text-sm text-text-main">
                            <span className="text-primary mr-2">{idx + 1}.</span>
                            {q.question}
                          </h4>
                          <div className="space-y-2 pl-6">
                            {q.options.map((opt, optIdx) => {
                               let optionClass = "border-border-main text-text-muted";
                               if (optIdx === q.correct_option_index) {
                                 optionClass = "border-primary bg-primary/10 text-primary font-bold";
                               } else if (optIdx === userAns && !isCorrect) {
                                 optionClass = "border-error bg-error/10 text-error font-bold";
                               }
                               return (
                                 <div key={optIdx} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${optionClass}`}>
                                   <span className="text-sm leading-relaxed">{opt}</span>
                                   {optIdx === q.correct_option_index && <span className="ml-auto text-xs uppercase tracking-wider text-primary">Correct Answer</span>}
                                   {optIdx === userAns && !isCorrect && <span className="ml-auto text-xs uppercase tracking-wider text-error">Your Answer</span>}
                                 </div>
                               );
                            })}
                          </div>
                          <div className="pl-6 pt-2">
                            <div className={`p-4 rounded-xl text-xs leading-relaxed ${isCorrect ? 'bg-primary/5 border border-primary/20 text-text-main' : 'bg-error/5 border border-error/20 text-text-main'}`}>
                              <span className="font-bold block mb-1">{isCorrect ? 'Great Job!' : 'Correction:'}</span>
                              {q.explanation || `The correct answer is: ${q.options[q.correct_option_index]}`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-6 border-t border-border-main flex justify-end gap-4">
                    {!quizResult.passed ? (
                      <button
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizResult(null);
                          setCurrentQuestionIndex(0);
                          setShowExplanation(false);
                        }}
                        className="btn bg-error/10 text-error hover:bg-error hover:text-white border border-error/20 px-8 py-3 rounded-xl font-bold transition-all"
                      >
                        Retake Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => setQuizResult(null)}
                        className="btn bg-primary text-white px-8 py-3 rounded-xl font-bold hover:brightness-110"
                      >
                        {assessmentStatus.submittedAssignment ? "Close Review" : "Proceed to Assignment"}
                      </button>
                    )}
                  </div>
                </div>
              ) : !assessmentStatus.passedQuiz && activeAssessment.quiz ? (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-border-main pb-4">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      Question {currentQuestionIndex + 1} of {activeAssessment.questions.length}
                    </span>
                    <div className="w-1/2 bg-border-main h-2 rounded-full overflow-hidden">
                      <style>{`
                        .assessment-progress-bar-inner {
                          width: ${((currentQuestionIndex + 1) / activeAssessment.questions.length) * 100}%;
                        }
                      `}</style>
                      <div 
                        className="bg-primary h-full transition-all assessment-progress-bar-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {(() => {
                      const q = activeAssessment.questions[currentQuestionIndex];
                      const userAns = quizAnswers[q.id];
                      const isCorrect = userAns === q.correct_option_index;

                      return (
                        <div key={q.id} className="space-y-6">
                          <h4 className="font-bold text-base sm:text-lg text-text-main leading-snug">
                            {q.question}
                          </h4>
                          <div className="space-y-3 pl-2 sm:pl-6">
                            {q.options.map((opt, optIdx) => {
                              let optionClass = "border-border-main hover:bg-bg-main text-text-muted cursor-pointer";
                              if (showExplanation) {
                                optionClass = "border-border-main text-text-muted opacity-60 cursor-not-allowed";
                                if (optIdx === q.correct_option_index) {
                                  optionClass = "border-primary bg-primary/10 text-primary font-bold cursor-default opacity-100";
                                } else if (optIdx === userAns && !isCorrect) {
                                  optionClass = "border-error bg-error/10 text-error font-bold cursor-default opacity-100";
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
              ) : (!assessmentStatus.submittedAssignment || !assessmentStatus.isGraded) && activeAssessment.assignment ? (
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
                      <label className="text-xs font-bold block mb-2 text-text-main">Upload Presentation/Slides (PDF, PPT, PPTX)</label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative flex flex-col items-center justify-center w-full p-8 rounded-2xl border-2 border-dashed border-primary/30 bg-bg-main/50 hover:bg-bg-main hover:border-primary/50 transition-all duration-300">
                          <input 
                            type="file" 
                            accept=".pdf,.ppt,.pptx"
                            required 
                            title="Upload presentation or slides"
                            placeholder="Upload presentation or slides"
                            aria-label="Upload presentation or slides"
                            onChange={e => setAssignmentFile(e.target.files?.[0] || null)} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          />
                          {!assignmentFile ? (
                            <div className="text-center space-y-2 pointer-events-none">
                              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                              </div>
                              <p className="text-sm font-bold text-primary">Click to browse or drag and drop</p>
                              <p className="text-xs text-text-muted">PDF, PPT, or PPTX up to 10MB</p>
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
                    <div className="flex justify-end pt-4">
                      <button type="submit" className="btn bg-primary text-white px-8 py-3 rounded-xl font-bold hover:brightness-110 shadow-sm">
                        Submit Assignment
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
    </>
  );
}
