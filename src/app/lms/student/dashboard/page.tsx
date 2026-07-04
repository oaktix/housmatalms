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
import { phase1Curriculum, hcpaCurriculum, Lesson } from "@/lib/curriculum";

const SURVEY_QUESTIONS = [
  { id: 1, text: "Agent vs. Manager Roles: Distinguishing the transaction-focused role of an Agent/Broker from the asset-custodian role of a professional Estate Manager." },
  { id: 2, text: "Nigerian Land Regulations: Navigating occupancy rights, Certificates of Occupancy, and governor's consent under the Land Use Act of 1978." },
  { id: 3, text: "Digital Management Platforms: Operating cloud-based tools (e.g. Housmata) to centralize property records and automate workflows." },
  { id: 4, text: "Listing Disclosure Protocols: Proactively disclosing historical defects (like flooding or plumbing damage) before viewings." },
  { id: 5, text: "Separation of Client Funds: Managing dedicated client rent accounts and preventing the comingling of client and personal funds." },
  { id: 6, text: "Move-in Inventory Checks: Designing detailed, timestamped inventory checklists with photographic proof to prevent tenant disputes." },
  { id: 7, text: "Habitability & Tenant Rights: Compelling landlords to fund structural repairs while firmly enforcing lease guidelines." },
  { id: 8, text: "Utility & Generator Operations: Coordinating diesel generators, boreholes, and water treatment systems for Nigerian properties." },
  { id: 9, text: "Real Estate Financials: Calculating rental yields, managing maintenance reserves, and auditing landlord ledgers." },
  { id: 10, text: "Eviction & Contract Dispute Mediation: Systematically navigating tenancy laws and resolving tenant payment defaults through legal channels." }
];

const HCPA_SURVEY_QUESTIONS = [
  { id: 1, text: "Land Titles and Documentation: Differentiating Survey Plans, C of Os, Deeds of Assignment, Excisions, and Gazettes." },
  { id: 2, text: "GPS Coordinate Charting: Plotting land coordinates to identify committed forest reserves or agricultural zones." },
  { id: 3, text: "Lands Registry Searches: Conducting official title verification searches to discover liens, mortgages, or ownership disputes." },
  { id: 4, text: "Land Banking & Growth Corridors: Sourcing undeveloped lands in infrastructure corridors for long-term appreciation." },
  { id: 5, text: "Property Finance & Installments: Designing structured milestone payment plans and calculating interest rate markups." },
  { id: 6, text: "Mortgage Readiness: Evaluating salary pay slips, tax filings, and debt-to-income ratios for bank financing approvals." },
  { id: 7, text: "Developer Vetting & Due Diligence: Researching developer track records, litigation history, and allocation timelines." },
  { id: 8, text: "Physical Site Inspections: Organizing and conducting structured property tours with active neighborhood storytelling." },
  { id: 9, text: "Deal Negotiation & Closing File: Structuring offer letters, reservation forms, and snag lists for property handovers." },
  { id: 10, text: "Digital Lead Funnels & CRM: Building social media listing campaigns and managing client databases systematically." }
];

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  
  // States
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tempSelectedClass, setTempSelectedClass] = useState<string>("");

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
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Survey States
  const [showPreSurvey, setShowPreSurvey] = useState(false);
  const [showPostSurvey, setShowPostSurvey] = useState(false);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<number, number>>({});
  const [surveySubmitting, setSurveySubmitting] = useState(false);
  const [surveyError, setSurveyError] = useState<string | null>(null);
  const [currentPreSurveyStep, setCurrentPreSurveyStep] = useState(0);
  const [currentPostSurveyStep, setCurrentPostSurveyStep] = useState(0);

  // Curriculum Display State
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>("module-1");

  // Load Data
  const loadStudentData = useCallback(() => {
    if (!currentUser) return;
    const studentId = currentUser.id;
    const studentProgress = db.getProgress(studentId);
    const activeCurriculum = studentProgress.course_id === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;

    // Proactively heal/promote modules where progress criteria are fully met
    activeCurriculum.forEach((mod) => {
      db.checkAndPromoteModule(studentId, mod.id);
    });

    const studentCohort = db.getStudentCohort(studentId);
    setCohort(studentCohort || null);

    setProgress(studentProgress);

    if (studentCohort) {
      setMeetings(db.getMeetings(studentCohort.id));
    }
    
    setAnnouncements(db.getAnnouncements(studentCohort?.id || ""));

    // Pre & Post Survey trigger checks
    const hasPre = db.getSurveyResponse(studentId, "pre");
    if (!hasPre) {
      setShowPreSurvey(true);
    } else {
      setShowPreSurvey(false);
      const finishedAllModules = activeCurriculum.every(mod => studentProgress?.completed_modules?.includes(mod.id));
      if (finishedAllModules) {
        const hasPost = db.getSurveyResponse(studentId, "post");
        if (!hasPost) {
          setShowPostSurvey(true);
        } else {
          setShowPostSurvey(false);
        }
      } else {
        setShowPostSurvey(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    loadStudentData();
    db.sync();
    return db.subscribe(loadStudentData);
  }, [loadStudentData]);

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

    // Find the current module to check for the next lesson
    const activeCurriculum = progress.course_id === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;
    const currentModule = activeCurriculum.find(m => m.id === selectedLesson.moduleId);
    const nextLessonIndex = selectedLesson.lessonIndex + 1;

    if (currentModule && nextLessonIndex < currentModule.lessons.length) {
      // Auto-advance to the next lesson in this module
      setSelectedLesson({
        lesson: currentModule.lessons[nextLessonIndex],
        moduleId: selectedLesson.moduleId,
        lessonIndex: nextLessonIndex
      });
    } else {
      // Last lesson in the module — close so the assessment button is visible
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

  const submitQuiz = async () => {
    if (!activeAssessment?.quiz || !currentUser) return;
    const { quiz, questions } = activeAssessment;
    
    let correctCount = 0;
    questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct_option_index) {
        correctCount++;
      }
    });

    const rawScore = (correctCount / questions.length) * 100;
    
    try {
      const attempt = await db.createQuizAttempt({
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
    } catch (err) {
      console.error("Quiz submission failed:", err);
    }
  };

  const submitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingAssignment || !activeAssessment?.assignment || !currentUser || !assignmentFile) return;

    // Validate file type is PDF.
    if (!assignmentFile.name.toLowerCase().endsWith(".pdf")) {
      setSubmissionError("Only PDF files are allowed for assignment submission.");
      return;
    }

    // Validate file size against the configured upload limit.
    const MAX_FILE_SIZE_MB = 20;
    if (assignmentFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setSubmissionError(`File is too large (${(assignmentFile.size / 1024 / 1024).toFixed(2)} MB). Please upload a file smaller than ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    const assignmentId = activeAssessment.assignment.id;
    const userId = currentUser.id;
    const fileName = assignmentFile.name;
    const text = assignmentText;

    setSubmittingAssignment(true);
    setSubmissionError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileDataUrl = event.target?.result as string;

      try {
        await db.createSubmission({
          assignment_id: assignmentId,
          user_id: userId,
          content_link: fileDataUrl,
          content_file_name: fileName,
          content_text: text
        });

        setSubmittingAssignment(false);
        setAssessmentStatus(prev => prev ? { ...prev, submittedAssignment: true, isGraded: false } : null);
        loadStudentData();
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } });

        // Auto-close modal and advance to the next module/lesson after a brief delay
        const currentModuleId = activeAssessment.moduleId;
        setTimeout(() => {
          setActiveAssessment(null);
          setAssessmentStatus(null);
          setQuizResult(null);

          // Find the next module in the curriculum
          const activeCurriculum = db.getProgress(currentUser!.id).course_id === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;
          const currentModuleIndex = activeCurriculum.findIndex(m => m.id === currentModuleId);
          const nextModule = activeCurriculum[currentModuleIndex + 1];
          if (nextModule) {
            // Expand the next module in the timeline
            setExpandedModuleId(nextModule.id);
            // Open the first lesson of the next module
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

  // Survey submission helper
  const handleSurveySubmit = async (type: "pre" | "post") => {
    if (!currentUser || !progress) return;
    const activeQuestions = progress.course_id === "property-advisor-hcpa" ? HCPA_SURVEY_QUESTIONS : SURVEY_QUESTIONS;
    const unanswered = activeQuestions.some(q => !surveyAnswers[q.id]);
    if (unanswered) {
      setSurveyError("Please answer all questions before submitting.");
      return;
    }

    setSurveySubmitting(true);
    setSurveyError(null);

    try {
      await db.createSurveyResponse(currentUser.id, type, surveyAnswers);
      setSurveySubmitting(false);
      setSurveyAnswers({});
      if (type === "pre") {
        setShowPreSurvey(false);
      } else {
        setShowPostSurvey(false);
      }
      loadStudentData();
      confetti({ particleCount: 150, spread: 60, origin: { y: 0.5 } });
    } catch (err) {
      setSurveySubmitting(false);
      const message = err instanceof Error ? err.message : "Failed to submit survey. Please try again.";
      setSurveyError(message);
    }
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

      {/* Onboarding Checklist & Growth Tracking */}
      <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="font-heading font-extrabold text-sm sm:text-base text-text-main flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Verified Operator Career Journey
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Track your progress from a candidate to a premium Partner Agency.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-text-muted bg-bg-main border border-border-main px-3 py-1 rounded-full">
              Overall Progress: {Math.round((progress.current_phase / 4) * 100)}%
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-bg-main h-2.5 rounded-full overflow-hidden border border-border-main">
          <style>{`
            .global-progress-bar-fill {
              width: ${(progress.current_phase / 4) * 100}%;
            }
          `}</style>
          <div 
            className="bg-gradient-to-r from-primary via-secondary to-accent h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_var(--primary)] global-progress-bar-fill"
          />
        </div>

        {/* Stepper Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              level: "Level 1",
              name: "Foundation Operator",
              requirement: "Phase 1 - Curriculums",
              desc: "Master the real estate ethics & professional ecosystems.",
              isCompleted: progress.current_phase > 1 || progress.completed_modules.length === (progress.course_id === "property-advisor-hcpa" ? hcpaCurriculum.length : phase1Curriculum.length),
              isActive: progress.current_phase === 1
            },
            {
              level: "Level 2",
              name: "Digital Systems Specialist",
              requirement: "Phase 2 - Live stream slots",
              desc: "Learn to automate generator operations, maintenance logs, and separation of client funds.",
              isCompleted: progress.current_phase > 2,
              isActive: progress.current_phase === 2
            },
            {
              level: "Level 3",
              name: "Operational Specialist",
              requirement: "Phase 3 - Field Practicals",
              desc: "Perform real inspection checklists and submit landlord listing yields.",
              isCompleted: progress.current_phase > 3,
              isActive: progress.current_phase === 3
            },
            {
              level: "Level 4",
              name: "Partner Agency",
              requirement: "Graduation & Verification Badge",
              desc: "Acquire client mandates and listing partnerships with Property Max.",
              isCompleted: progress.current_phase === 4,
              isActive: progress.current_phase === 4
            }
          ].map((step, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                step.isCompleted ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' :
                step.isActive ? 'bg-secondary/5 border-secondary/30 hover:bg-secondary/10 shadow-[0_0_15px_rgba(43,108,176,0.15)]' :
                'bg-bg-main border-border-main/50 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    step.isCompleted ? 'text-primary' : step.isActive ? 'text-secondary' : 'text-text-muted'
                  }`}>{step.level}</span>
                  {step.isCompleted && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  {step.isActive && <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />}
                </div>
                <h4 className="font-bold text-xs text-text-main">{step.name}</h4>
                <p className="text-[10px] text-text-muted leading-relaxed">{step.desc}</p>
              </div>
              <div className="pt-3 mt-3 border-t border-border-main/40 flex justify-between items-center text-[9px] font-extrabold uppercase">
                <span className="text-text-muted">{step.requirement}</span>
                <span className={step.isCompleted ? 'text-primary' : step.isActive ? 'text-secondary' : 'text-text-muted'}>
                  {step.isCompleted ? 'Unlocked' : step.isActive ? 'In Progress' : 'Locked'}
                </span>
              </div>
            </div>
          ))}
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
        <div className="space-y-8 animate-fade-in">
          {/* Course-aware header */}
          {(() => {
            const activeCurriculum = progress.course_id === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;
            const courseTitle = progress.course_id === "property-advisor-hcpa" ? "HCPA Self-Paced Modules" : "Foundation Curriculum";
            return (
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-heading font-extrabold text-text-main">{courseTitle}</h2>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-bg-main border border-border-main text-text-muted">
                  {progress.completed_modules.length} / {activeCurriculum.length} Modules Completed
                </span>
              </div>
            );
          })()}

          {/* Vertical Timeline Curriculum Layout */}
          <div className="relative border-l border-border-main/60 ml-4 sm:ml-8 pl-8 sm:pl-12 space-y-8 py-4">
            {/* Animated progress track on timeline */}
            <style>{`
              .timeline-progress-track-fill {
                width: 3px;
                height: ${Math.min(100, (progress.completed_modules.length / phase1Curriculum.length) * 100)}%;
              }
            `}</style>
            <div 
              className="absolute left-[-1.5px] top-0 bg-gradient-to-b from-primary via-primary-light to-secondary transition-all duration-1000 shadow-[0_0_8px_var(--primary)] timeline-progress-track-fill"
            />

            {(() => {
              const activeCurriculum = progress.course_id === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;
              return activeCurriculum.map((mod, index) => {
              const isCompleted = progress.completed_modules.includes(mod.id);
              const isUnlocked = index === 0 || progress.completed_modules.includes(activeCurriculum[index - 1].id);
              const isExpanded = expandedModuleId === mod.id;

              return (
                <div 
                  key={mod.id} 
                  className="relative group transition-all duration-300"
                >
                  {/* Timeline Node Dot */}
                  <div className={`absolute left-[-45px] sm:left-[-61px] top-4 w-9 h-9 rounded-full border-4 border-bg-main flex items-center justify-center font-bold text-xs transition-all duration-500 z-10 ${
                    isCompleted ? 'bg-primary text-white shadow-[0_0_12px_var(--primary)]' :
                    isUnlocked ? 'bg-bg-card border-primary text-primary shadow-[0_0_8px_rgba(38,196,150,0.2)]' : 'bg-bg-main text-text-muted border-border-main'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </div>

                  <div 
                    className={`premium-card rounded-2xl border p-5 sm:p-6 space-y-4 transition-all duration-300 overflow-hidden ${
                      isCompleted ? 'bg-primary-glow/5 border-primary/20' : 
                      isUnlocked ? 'bg-bg-card border-border-main hover:border-border-main-hover' : 'bg-bg-main border-border-main/50 opacity-60'
                    }`}
                  >
                    {/* Header Row */}
                    <div 
                      className="flex justify-between items-center cursor-pointer select-none"
                      onClick={() => {
                        if (isUnlocked) {
                          setExpandedModuleId(isExpanded ? null : mod.id);
                        }
                      }}
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
                          
                          const allLessonsRead = mod.lessons.every((_, idx) => progress.read_lessons?.includes(`${mod.id}-lesson-${idx}`));
                          
                          if (!isCompleted && isUnlocked) {
                            if (hasAssessment) {
                              if (allLessonsRead) {
                                return (
                                  <button
                                    onClick={() => handleOpenAssessment(mod.id)}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary hover:to-primary-light hover:text-white border border-primary/30 text-xs font-black text-primary transition-all duration-300 hover:shadow-[0_0_20px_rgba(38,196,150,0.3)] flex items-center justify-center gap-2 group"
                                  >
                                    <Award className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Launch End-of-Module Assessment
                                  </button>
                                );
                              } else {
                                return (
                                  <button disabled className="w-full py-2.5 rounded-xl border border-border-main bg-bg-main text-text-muted/50 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-not-allowed">
                                    <Lock className="w-4 h-4 opacity-75" />
                                    Read all lessons above to unlock assessment
                                  </button>
                                );
                              }
                            } else {
                              return (
                                <div className="w-full py-2.5 p-3 rounded-xl border border-border-main bg-bg-main text-xs font-semibold text-text-muted text-center">
                                  Read all lessons to complete this module.
                                </div>
                              );
                            }
                          } else if (isCompleted) {
                            if (hasAssessment) {
                              const grades = db.getFinalModuleGrade(currentUser.id, mod.id);
                              if (grades) {
                                return (
                                  <div className="w-full p-4 rounded-xl border border-border-main bg-bg-main space-y-2">
                                    <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest text-center">Module Evaluation</h4>
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-text-muted">Quiz (30%)</span>
                                      <span className="font-bold text-text-main">{grades.quizScore.toFixed(0)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-text-muted">Assignment (70%)</span>
                                      <span className="font-bold text-text-main">{grades.assignmentGrade.toFixed(0)}%</span>
                                    </div>
                                    <div className="pt-2 mt-2 border-t border-border-main flex justify-between items-center text-xs font-black">
                                      <span className="text-primary">Weighted Score</span>
                                      <span className="text-primary">{grades.finalGrade.toFixed(0)}%</span>
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="w-full space-y-2">
                                    <div className="py-2.5 p-3 rounded-xl border border-border-main bg-bg-main text-xs font-semibold text-text-muted text-center">
                                      Module Completed. Awaiting assignment grading.
                                    </div>
                                    <button
                                      onClick={() => handleOpenAssessment(mod.id)}
                                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary hover:to-primary-light hover:text-white border border-primary/30 text-xs font-bold text-primary transition-all duration-300 flex items-center justify-center gap-2 group"
                                    >
                                      <Award className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                      View / Resubmit Assignment
                                    </button>
                                  </div>
                                );
                              }
                            } else {
                              return (
                                <div className="w-full py-2 p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs font-bold text-primary text-center">
                                  Module Completed ✓
                                </div>
                              );
                            }
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              );
              })
              })()}
          </div>
        </div>
      )}

      {/* Phase 2 View */}
      {activeTab === "phase2" && (
        <div className="space-y-6 animate-fade-in">
          {progress.current_phase < 2 ? (
            <div className="premium-card rounded-2xl bg-bg-card border-border-main p-12 text-center space-y-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-bg-main border border-border-main flex items-center justify-center">
                <Lock className="w-8 h-8 text-text-muted" />
              </div>
              <h2 className="text-xl font-heading font-extrabold text-text-main">Phase 2 is Locked</h2>
              <p className="text-sm text-text-muted max-w-md">
                You must complete all {progress.course_id === "property-advisor-hcpa" ? hcpaCurriculum.length : phase1Curriculum.length} self-paced modules to unlock Phase 2: Live Bootcamp Sessions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-6">
                {/* Welcome Card */}
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

                {/* Virtual Class Selection / Status Card */}
                <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 md:p-8 space-y-6 shadow-sm">
                  <div className="flex justify-between items-start gap-4 border-b border-border-main pb-4">
                    <div>
                      <h3 className="font-heading font-bold text-base text-text-main flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-secondary" />
                        Phase 2 Virtual Class Enrollment
                      </h3>
                      <p className="text-xs text-text-muted mt-1">Select and attend one of the four scheduled interactive live training slots.</p>
                    </div>
                    {progress.selected_class ? (
                      <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full">
                        Enrolled
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full">
                        Action Required
                      </span>
                    )}
                  </div>

                  {!progress.selected_class ? (
                    <div className="space-y-4">
                      <p className="text-xs text-text-muted leading-relaxed">
                        To continue with the bootcamp, choose your preferred session from the four available date options below:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          "Class 1: Tuesday, July 7, 2026 - 5:00 PM",
                          "Class 2: Tuesday, July 14, 2026 - 5:00 PM",
                          "Class 3: Tuesday, July 21, 2026 - 5:00 PM",
                          "Class 4: Tuesday, July 28, 2026 - 5:00 PM",
                        ].map((slot) => (
                          <label
                            key={slot}
                            className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer hover:bg-bg-main/55 transition-all ${
                              tempSelectedClass === slot
                                ? "border-secondary bg-secondary/5 text-text-main shadow-sm"
                                : "border-border-main bg-bg-main/30 text-text-muted"
                            }`}
                          >
                            <input
                              type="radio"
                              name="class-slot"
                              className="mt-1"
                              checked={tempSelectedClass === slot}
                              onChange={() => setTempSelectedClass(slot)}
                            />
                            <div className="text-xs">
                              <span className="font-bold block text-text-main">
                                {slot.split(":")[0]}
                              </span>
                              <span className="text-[10px] text-text-muted mt-0.5 block">
                                {slot.split(":")[1]}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          disabled={!tempSelectedClass}
                          onClick={() => handleSelectClass(tempSelectedClass)}
                          className="btn bg-secondary text-white hover:brightness-110 px-6 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                          Confirm Enrollment
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-4 rounded-xl bg-bg-main border border-border-main flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Your Selected Session</span>
                          <span className="text-xs font-bold text-text-main mt-0.5 block">{progress.selected_class}</span>
                        </div>
                      </div>

                      {/* Meeting URL Section */}
                      <div className="p-6 rounded-xl border border-secondary/20 bg-secondary/5 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-text-main">Live Stream / Meeting Link</h4>
                            <p className="text-[10px] text-text-muted">The class link will be displayed below once verified by the Admin.</p>
                          </div>
                        </div>

                        {progress.phase2_meeting_url ? (
                          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border-main/50">
                            <div className="min-w-0">
                              <span className="text-[9px] uppercase tracking-wider font-extrabold text-text-muted block">Direct Class URL</span>
                              <span className="text-xs text-secondary truncate font-semibold block mt-0.5">{progress.phase2_meeting_url}</span>
                            </div>
                            <a
                              href={progress.phase2_meeting_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn bg-secondary text-white hover:brightness-110 px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                              Join Meeting
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <p className="text-xs text-warning italic bg-warning/5 border border-warning/10 p-3 rounded-lg mt-2">
                            Awaiting meeting link from admin. You will receive an email notice when it is ready.
                          </p>
                        )}
                      </div>

                      {/* Attendance Card */}
                      <div className="p-4 rounded-xl bg-bg-main border border-border-main flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Attendance Verification</span>
                          <p className="text-[10px] text-text-muted">Your attendance status will be logged after class completion.</p>
                        </div>
                        <div>
                          {progress.phase2_attendance === "present" ? (
                            <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Present
                            </span>
                          ) : progress.phase2_attendance === "absent" ? (
                            <span className="text-xs font-bold text-error bg-error/10 border border-error/20 px-3 py-1 rounded-full">
                              Absent
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-text-muted bg-bg-card border border-border-main px-3 py-1 rounded-full">
                              Not Marked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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
        <div className="space-y-6 animate-fade-in">
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

      {/* Pre-Course Survey Modal Overlay */}
      {showPreSurvey && (() => {
        const activeQuestions = progress?.course_id === "property-advisor-hcpa" ? HCPA_SURVEY_QUESTIONS : SURVEY_QUESTIONS;
        const currentQ = currentPreSurveyStep > 0 && currentPreSurveyStep <= 10 ? activeQuestions[currentPreSurveyStep - 1] : null;
        const percentComplete = Math.round(((currentPreSurveyStep) / 11) * 100);

        return (
          <div className="fixed inset-0 bg-bg-main/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="premium-card rounded-2xl bg-bg-card border-border-main max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-in relative">
              <div className="text-center space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary-glow border border-primary/20 px-3 py-1 rounded-full">
                  Outcome Harvesting — Step {currentPreSurveyStep} of 11
                </span>
                <h2 className="text-lg sm:text-xl font-heading font-black text-text-main">
                  {progress?.course_id === "property-advisor-hcpa" ? "Property Advisor (HCPA) Pre-Survey" : "Real Estate Manager (HCEM) Pre-Survey"}
                </h2>
              </div>

              {/* Progress Tracking Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-extrabold text-text-muted">
                  <span>Progress Check</span>
                  <span>{percentComplete}% Complete</span>
                </div>
                <div className="h-2 w-full bg-bg-main rounded-full overflow-hidden border border-border-main/50">
                  <div 
                    className="h-full bg-primary transition-all duration-500 shadow-[0_0_8px_var(--primary)]"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
              </div>

              {/* Survey Content Screens */}
              <div className="py-4 border-t border-b border-border-main/40 min-h-[220px] flex flex-col justify-center">
                {currentPreSurveyStep === 0 ? (
                  /* Welcome Slide (Step 0) */
                  <div className="space-y-4 text-center animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-primary-glow flex items-center justify-center text-primary mx-auto">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-md mx-auto">
                      Before starting your certification journey, we want to assess your current knowledge level. 
                    </p>
                    <div className="p-4 rounded-xl bg-primary-glow/40 border border-primary/20 text-left text-xs space-y-2 max-w-md mx-auto">
                      <p className="font-extrabold text-primary flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Important Note:
                      </p>
                      <p className="text-text-muted leading-relaxed">
                        This pre-survey is <strong>NOT a graded test</strong>. It does not impact your academic score or module completion metrics in any way. It is purely designed to record baseline levels so we can measure educational impact at graduation. Please answer honestly!
                      </p>
                    </div>
                    <p className="text-[10px] text-text-muted/80 font-bold italic">
                      &ldquo;Every expert operator started right where you are today.&rdquo;
                    </p>
                  </div>
                ) : currentPreSurveyStep <= 10 && currentQ ? (
                  /* Question Slides (Step 1-10) */
                  <div className="space-y-5 animate-fade-in">
                    <div className="text-center space-y-2">
                      <span className="text-[10px] text-primary uppercase font-bold tracking-widest">
                        Assessment Topic {currentQ.id}
                      </span>
                      <p className="text-sm sm:text-base font-bold text-text-main leading-snug">
                        {currentQ.text}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-text-muted text-center">
                        Select Your Pre-Course Knowledge Level:
                      </p>
                      <div className="flex justify-between items-center gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSurveyAnswers(prev => ({ ...prev, [currentQ.id]: val }))}
                            className={`flex-1 py-3 text-center text-xs font-black border rounded-xl transition-all duration-300 ${
                              surveyAnswers[currentQ.id] === val
                                ? 'bg-primary border-primary text-white shadow-[0_0_12px_rgba(2,184,117,0.4)] scale-105'
                                : 'bg-bg-main border-border-main text-text-muted hover:border-primary/45 hover:bg-bg-card-hover'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted px-1 font-bold">
                        <span>1 — No Knowledge</span>
                        <span>5 — Expert Profile</span>
                      </div>
                    </div>
                    
                    {/* Encouraging caption based on selection */}
                    {surveyAnswers[currentQ.id] && (
                      <p className="text-[10px] text-center font-bold text-primary animate-pulse">
                        {surveyAnswers[currentQ.id] >= 4 ? "Impressive starting level! Let's continue." : "Perfect! We will cover this in detail."}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Final Slide (Step 11) */
                  <div className="text-center space-y-4 animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-primary-glow flex items-center justify-center text-primary mx-auto animate-bounce">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-text-main">
                      You are ready to begin!
                    </h3>
                    <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                      All questions have been evaluated. Click submit below to save your responses and unlock your learning timeline. Let&apos;s build some systems!
                    </p>
                  </div>
                )}
              </div>

              {surveyError && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold text-center">
                  {surveyError}
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-4 pt-2">
                {currentPreSurveyStep > 0 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentPreSurveyStep(prev => prev - 1)}
                    className="btn border border-border-main text-text-muted hover:text-text-main px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {currentPreSurveyStep < 11 ? (
                  <button
                    type="button"
                    disabled={currentPreSurveyStep > 0 && currentQ ? !surveyAnswers[currentQ.id] : false}
                    onClick={() => setCurrentPreSurveyStep(prev => prev + 1)}
                    className="btn bg-primary text-white hover:brightness-110 px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                  >
                    {currentPreSurveyStep === 0 ? "Start Survey" : "Next Topic"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={surveySubmitting}
                    onClick={() => handleSurveySubmit("pre")}
                    className="btn bg-primary text-white hover:brightness-110 px-8 py-2.5 rounded-xl text-xs font-extrabold shadow-md disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                  >
                    {surveySubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {surveySubmitting ? 'Saving...' : 'Submit & Start Course'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Post-Course Survey Modal Overlay */}
      {showPostSurvey && (() => {
        const activeQuestions = progress?.course_id === "property-advisor-hcpa" ? HCPA_SURVEY_QUESTIONS : SURVEY_QUESTIONS;
        const currentQ = currentPostSurveyStep > 0 && currentPostSurveyStep <= 10 ? activeQuestions[currentPostSurveyStep - 1] : null;
        const percentComplete = Math.round(((currentPostSurveyStep) / 11) * 100);

        return (
          <div className="fixed inset-0 bg-bg-main/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="premium-card rounded-2xl bg-bg-card border-border-main max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-in relative">
              <div className="text-center space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                  Post-Course Assessment — Step {currentPostSurveyStep} of 11
                </span>
                <h2 className="text-lg sm:text-xl font-heading font-black text-text-main">
                  {progress?.course_id === "property-advisor-hcpa" ? "Property Advisor (HCPA) Post-Survey" : "Real Estate Manager (HCEM) Post-Survey"}
                </h2>
              </div>

              {/* Progress Tracking Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-extrabold text-text-muted">
                  <span>Verification Progress</span>
                  <span>{percentComplete}% Complete</span>
                </div>
                <div className="h-2 w-full bg-bg-main rounded-full overflow-hidden border border-border-main/50">
                  <div 
                    className="h-full bg-secondary transition-all duration-500 shadow-[0_0_8px_var(--secondary)]"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
              </div>

              {/* Survey Content Screens */}
              <div className="py-4 border-t border-b border-border-main/40 min-h-[220px] flex flex-col justify-center">
                {currentPostSurveyStep === 0 ? (
                  /* Welcome Slide (Step 0) */
                  <div className="space-y-4 text-center animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mx-auto">
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-text-main">
                      Congratulations on completing the curriculum!
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-md mx-auto">
                      Before we issue your official professional credentials, let&apos;s re-assess your knowledge level across the core modules.
                    </p>
                    <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-left text-xs space-y-2 max-w-md mx-auto">
                      <p className="font-extrabold text-secondary flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 animate-spin-slow" />
                        Final Evaluation Note:
                      </p>
                      <p className="text-text-muted leading-relaxed">
                        Like the pre-survey, this final survey is <strong>NOT a test</strong> and has no impact on your completed module grades. It helps the academic board verify your overall growth.
                      </p>
                    </div>
                  </div>
                ) : currentPostSurveyStep <= 10 && currentQ ? (
                  /* Question Slides (Step 1-10) */
                  <div className="space-y-5 animate-fade-in">
                    <div className="text-center space-y-2">
                      <span className="text-[10px] text-secondary uppercase font-bold tracking-widest">
                        Module Verification {currentQ.id}
                      </span>
                      <p className="text-sm sm:text-base font-bold text-text-main leading-snug">
                        {currentQ.text}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-text-muted text-center">
                        Select Your Current Knowledge Level:
                      </p>
                      <div className="flex justify-between items-center gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSurveyAnswers(prev => ({ ...prev, [currentQ.id]: val }))}
                            className={`flex-1 py-3 text-center text-xs font-black border rounded-xl transition-all duration-300 ${
                              surveyAnswers[currentQ.id] === val
                                ? 'bg-secondary border-secondary text-white shadow-[0_0_12px_rgba(43,108,176,0.4)] scale-105'
                                : 'bg-bg-main border-border-main text-text-muted hover:border-secondary/45 hover:bg-bg-card-hover'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted px-1 font-bold">
                        <span>1 — No Knowledge</span>
                        <span>5 — Expert Profile</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Final Slide (Step 11) */
                  <div className="text-center space-y-4 animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mx-auto animate-bounce">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-text-main">
                      Ready to unlock your Certification!
                    </h3>
                    <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                      All verification parameters are now logged. Click the submit button below to finalize your records and harvest your official certificate credentials!
                    </p>
                  </div>
                )}
              </div>

              {surveyError && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold text-center">
                  {surveyError}
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-4 pt-2">
                {currentPostSurveyStep > 0 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentPostSurveyStep(prev => prev - 1)}
                    className="btn border border-border-main text-text-muted hover:text-text-main px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {currentPostSurveyStep < 11 ? (
                  <button
                    type="button"
                    disabled={currentPostSurveyStep > 0 && currentQ ? !surveyAnswers[currentQ.id] : false}
                    onClick={() => setCurrentPostSurveyStep(prev => prev + 1)}
                    className="btn bg-secondary text-white hover:brightness-110 px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                  >
                    {currentPostSurveyStep === 0 ? "Start Survey" : "Next Topic"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={surveySubmitting}
                    onClick={() => handleSurveySubmit("post")}
                    className="btn bg-secondary text-white hover:brightness-110 px-8 py-2.5 rounded-xl text-xs font-extrabold shadow-md disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                  >
                    {surveySubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {surveySubmitting ? 'Saving...' : 'Submit & Unlock Certification'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
