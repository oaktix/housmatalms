"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Award,
  Sparkles,
  Megaphone,
  ArrowRight,
  Shield,
  Crown,
  Zap,
  Settings,
  Sprout,
} from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Cohort, StudentProgress, Announcement } from "@/lib/mockData";
import { phase1Curriculum, hcpaCurriculum } from "@/lib/curriculum";
import StudentLayout from "@/components/StudentLayout";

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
  { id: 4, text: "Land Banking & Growth Corridors: Sourcing undeveloped locations in infrastructure corridors for long-term appreciation." },
  { id: 5, text: "Property Finance & Installments: Designing structured milestone payment plans and calculating interest rate markups." },
  { id: 6, text: "Mortgage Readiness: Evaluating salary pay slips, tax filings, and debt-to-income ratios for bank financing approvals." },
  { id: 7, text: "Developer Vetting & Due Diligence: Researching developer track records, litigation history, and allocation timelines." },
  { id: 8, text: "Physical Site Inspections: Organizing and conducting structured property tours with active neighborhood storytelling." },
  { id: 9, text: "Deal Negotiation & Closing File: Structuring offer letters, reservation forms, and snag lists for property handovers." },
  { id: 10, text: "Digital Lead Funnels & CRM: Building social media listing campaigns and managing client databases systematically." }
];

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  // Hold latest currentUser in a ref so loadStudentData (subscribed to db)
  // always reads the fresh value without needing a new function reference.
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);
  
  // States
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Survey States
  const [showPreSurvey, setShowPreSurvey] = useState(false);
  const [showPostSurvey, setShowPostSurvey] = useState(false);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<number, number>>({});
  const [surveySubmitting, setSurveySubmitting] = useState(false);
  const [surveyError, setSurveyError] = useState<string | null>(null);
  const [currentPreSurveyStep, setCurrentPreSurveyStep] = useState(0);
  const [currentPostSurveyStep, setCurrentPostSurveyStep] = useState(0);

  const preSurveyBarRef = useRef<HTMLDivElement>(null);
  const postSurveyBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preSurveyBarRef.current) {
      const pct = Math.round((currentPreSurveyStep / 11) * 100);
      preSurveyBarRef.current.style.width = `${pct}%`;
    }
  }, [currentPreSurveyStep]);

  useEffect(() => {
    if (postSurveyBarRef.current) {
      const pct = Math.round((currentPostSurveyStep / 11) * 100);
      postSurveyBarRef.current.style.width = `${pct}%`;
    }
  }, [currentPostSurveyStep]);

  // Stable data loader: never changes identity so db.subscribe never
  // unsubscribes/resubscribes on every render (which was the survey flicker).
  const loadStudentData = useCallback(() => {
    const user = currentUserRef.current;
    if (!user) return;
    const studentId = user.id;
    const studentProgress = db.getProgress(studentId);
    const activeCurriculum = studentProgress.course_id === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;

    const studentCohort = db.getStudentCohort(studentId);
    setCohort(studentCohort || null);
    setProgress(studentProgress);
    
    setAnnouncements(db.getAnnouncements(studentCohort?.id || ""));

    // Pre & Post Survey trigger checks
    const localPreFlag = typeof window !== "undefined" && localStorage.getItem(`survey_completed_pre_${studentId}`);
    const hasPre = localPreFlag === "true" || !!db.getSurveyResponse(studentId, "pre");
    if (!hasPre) {
      setShowPreSurvey(true);
    } else {
      setShowPreSurvey(false);
      const finishedAllModules = activeCurriculum.every(mod => studentProgress?.completed_modules?.includes(mod.id));
      if (finishedAllModules) {
        // Nudge check for unscheduled stream
        if (!studentProgress.selected_class) {
          const emailSentFlag = typeof window !== "undefined" && localStorage.getItem(`nudge_email_sent_${studentId}`);
          if (emailSentFlag !== "true") {
            db.logEmail(
              user.email,
              "Urgent Action: Select Live Class Stream to Proceed",
              `Hello ${user.full_name},\n\nYou have successfully completed all curriculum modules! However, you have not selected a live class stream slot yet.\n\nPlease log in to your dashboard and navigate to "Meetings & Live" to choose one of the available Tuesday slot options so that we can verify your progress and promote you to Phase 3 Field Practicals.\n\nBest regards,\nHousmata Academy Team`
            );
            if (typeof window !== "undefined") {
              localStorage.setItem(`nudge_email_sent_${studentId}`, "true");
            }
          }
        }

        const localPostFlag = typeof window !== "undefined" && localStorage.getItem(`survey_completed_post_${studentId}`);
        const hasPost = localPostFlag === "true" || !!db.getSurveyResponse(studentId, "post");
        if (!hasPost) {
          setShowPostSurvey(true);
        } else {
          setShowPostSurvey(false);
        }
      } else {
        setShowPostSurvey(false);
      }
    }
  }, []); // stable: reads currentUser via ref, never recreated

  // Subscribe once on mount. loadStudentData identity never changes,
  // so this effect never re-fires due to function reference changes.
  useEffect(() => {
    loadStudentData();
    return db.subscribe(loadStudentData);
  }, [loadStudentData]);

  // Re-run data load when the logged-in user actually changes (e.g. login/logout)
  useEffect(() => {
    if (currentUser) loadStudentData();
  }, [currentUser, loadStudentData]);

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
      if (typeof window !== "undefined") {
        localStorage.setItem(`survey_completed_${type}_${currentUser.id}`, "true");
      }
      setSurveySubmitting(false);
      setSurveyAnswers({});
      if (type === "pre") {
        setShowPreSurvey(false);
      } else {
        setShowPostSurvey(false);
      }
      loadStudentData();
    } catch (err) {
      setSurveySubmitting(false);
      const message = err instanceof Error ? err.message : "Failed to submit survey. Please try again.";
      setSurveyError(message);
    }
  };

  if (!currentUser || !progress) return null;

  const activeCurriculum = progress.course_id === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;
  const courseTitle = progress.course_id === "property-advisor-hcpa" ? "Housmata Certified Property Advisor" : "Housmata Certified Estate Manager";

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-text-main flex items-center gap-2">
              Welcome back, {currentUser.full_name}!
              <Sparkles className="w-5 h-5 text-primary" />
            </h1>
            <p className="text-xs text-text-muted">
              Assigned Course: <span className="font-bold text-text-main">{courseTitle}</span>
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="text-xs">
              <span className="text-text-muted block">Cohort</span>
              <span className="font-bold text-text-main block mt-0.5">{cohort ? cohort.name : "Unassigned"}</span>
            </div>
            <div className="text-xs">
              <span className="text-text-muted block">Current Phase</span>
              <span className="font-bold text-primary block mt-0.5">Phase {progress.current_phase}</span>
            </div>
            <div className="text-xs">
              <span className="text-text-muted block">Milestone Badge</span>
              {(() => {
                const getBadge = (count: number) => {
                  if (count >= 10) return { name: "Ecosystem Expert", icon: <Crown className="w-3 h-3" />, style: "bg-green-950/20 border-green-500/30 text-green-400" };
                  if (count >= 8) return { name: "Specialist", icon: <Zap className="w-3 h-3" />, style: "bg-accent-glow border-accent/20 text-accent" };
                  if (count >= 4) return { name: "Apprentice", icon: <Settings className="w-3 h-3" />, style: "bg-secondary-glow border-secondary/20 text-secondary" };
                  return { name: "Novice", icon: <Sprout className="w-3 h-3" />, style: "bg-bg-main border-border-main text-text-muted" };
                };
                const badge = getBadge(progress.completed_modules.length);
                return (
                  <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${badge.style}`}>
                    {badge.icon}
                    {badge.name}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Nudge Warning Banner */}
        {progress.completed_modules.length === activeCurriculum.length && !progress.selected_class && (
          <div className="p-5 border border-accent/25 bg-accent-glow/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
            <div className="space-y-1">
              <h4 className="text-xs font-black text-text-main flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-accent" />
                Next Milestone Action Required
              </h4>
              <p className="text-[10px] text-text-muted leading-relaxed">
                You have successfully completed all Phase 1 Modules! Please select one of the 4 Tuesday live class slots to unlock your Phase 3 Field Practicals.
              </p>
            </div>
            <Link
              href="/lms/student/meetings"
              className="btn bg-accent text-text-inverse hover:brightness-110 px-4 py-2 rounded-xl text-[10px] font-extrabold shadow-sm whitespace-nowrap"
            >
              Select Tuesday Slot
            </Link>
          </div>
        )}

        {/* Directory Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 flex flex-col justify-between hover:border-primary/40 transition-all duration-300">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary-glow flex items-center justify-center text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-text-main">Curriculum Path</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Access self-paced modules, read lessons, pass attempts, and submit assignments.
              </p>
            </div>
            <Link
              href="/lms/student/curriculum"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-light transition-all"
            >
              Enter Curriculum Room
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 flex flex-col justify-between hover:border-secondary/40 transition-all duration-300">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-text-main">Meetings &amp; Live</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Attend live class stream sessions, book stream slots, and launch simulated sandbox utilities.
              </p>
            </div>
            <Link
              href="/lms/student/meetings"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-secondary-light transition-all"
            >
              Launch Live Spaces
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 flex flex-col justify-between hover:border-accent/40 transition-all duration-300">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-text-main">Grades &amp; Feedback</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Review quiz results, assignment feedback notes, and track your overall performance logs.
              </p>
            </div>
            <Link
              href="/lms/student/grades"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-light transition-all"
            >
              Open Gradebook
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Global Progression Checklist */}
        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-sm sm:text-base text-text-main flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Verified Operator Career Journey
              </h3>
              <p className="text-xs text-text-muted mt-0.5">Track your progress from a candidate to a premium Partner Agency.</p>
            </div>
            <span className="text-[10px] font-black uppercase text-text-muted bg-bg-main border border-border-main px-3 py-1 rounded-full">
              Overall Progress: {Math.round((progress.current_phase / 4) * 100)}%
            </span>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                level: "Level 1",
                name: "Foundation Operator",
                requirement: "Phase 1 - Curriculums",
                desc: "Master the real estate ethics & professional ecosystems.",
                isCompleted: progress.current_phase > 1 || progress.completed_modules.length === activeCurriculum.length,
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
                  step.isActive ? 'bg-secondary/5 border-secondary/30 hover:bg-secondary/10 shadow-[0_0_15px_rgba(43,108,176,0.15)] animate-pulse' :
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
              Latest Announcements &amp; Academy Broadcasts
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
      </div>

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
                   Outcome Harvesting · Step {currentPreSurveyStep} of 11
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
                    ref={preSurveyBarRef}
                    className="h-full bg-primary transition-all duration-500 shadow-[0_0_8px_var(--primary)]"
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
                        <span>1 · No Knowledge</span>
                        <span>5 · Expert Profile</span>
                      </div>
                    </div>
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
                   Post-Course Assessment · Step {currentPostSurveyStep} of 11
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
                    ref={postSurveyBarRef}
                    className="h-full bg-secondary transition-all duration-500 shadow-[0_0_8px_var(--secondary)]"
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
                        <span>1 · No Knowledge</span>
                        <span>5 · Expert Profile</span>
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
    </StudentLayout>
  );
}
