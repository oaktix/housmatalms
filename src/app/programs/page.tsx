"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Calendar, CheckCircle2, ChevronRight, Home, TrendingUp, Sparkles, Award, UserCheck, AlertTriangle, FileText } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

const HCEM_PHASES = [
  {
    phase: "Phase 1",
    title: "Foundation Training: Real Estate OS",
    desc: "Grounds trainees in fundamental real estate principles: ethics, landlord/tenant psychology, inspection forms, and tenancy documentation.",
    meta: [
      { icon: Clock, label: "Duration: 8–12 Weeks" },
      { icon: BookOpen, label: "Curriculum: 9 Modules" },
    ],
    bullets: [
      "Ethics as an operating system (Rule-based funds).",
      "Structural property inspection checks.",
      "Tenancy agreements and inventory sheet rules.",
      "Negotiation and objection handling.",
    ],
  },
  {
    phase: "Phase 2",
    title: "Live Bootcamp Sessions",
    desc: "Transition from theory to digital property management. Execution-focused live sessions covering listings standardisation, tenant scoring KYC, rent ledger tracking, and capstone simulations.",
    meta: [
      { icon: Calendar, label: "Frequency: 3 Live Classes / Week" },
      { icon: Clock, label: "Duration: Intensive Bootcamp" },
    ],
    bullets: [
      "Listings control and digital property records.",
      "Tenant KYC & scoring frameworks.",
      "Landlord CRM and rent ledger management.",
      "Maintenance board & document auto-generation.",
    ],
  },
  {
    phase: "Phase 3",
    title: "Field Practicals",
    desc: "Supervised practical deployment: inspect real properties, manage a live portfolio, and document your fieldwork for certification submission.",
    meta: [
      { icon: Calendar, label: "Duration: 4–8 Weeks" },
      { icon: CheckCircle2, label: "Supervised Field Assessments" },
    ],
    bullets: [
      "In-person property inspections.",
      "Live portfolio management tasks.",
      "Structured field report documentation.",
      "Final certification submission.",
    ],
  },
];

const HCPA_PHASES = [
  {
    phase: "Phase 1",
    title: "Self-Paced Modules",
    desc: "16 comprehensive modules covering property verification, due diligence, market valuation, investment advisory, and legal compliance for the Nigerian property market.",
    meta: [
      { icon: Clock, label: "Self-Paced" },
      { icon: BookOpen, label: "Curriculum: 16 Modules" },
    ],
    bullets: [
      "Property documentation & title verification.",
      "Due diligence and land search procedures.",
      "Market valuation and investment analysis.",
      "Fraud detection and risk management.",
    ],
  },
  {
    phase: "Phase 2",
    title: "Live Bootcamp Sessions",
    desc: "Intensive live-streamed sessions translating theory into applied advisory practice: case studies, negotiation tactics, deal structuring, and regulatory compliance.",
    meta: [
      { icon: Calendar, label: "Frequency: 3 Live Classes / Week" },
      { icon: Clock, label: "Duration: Intensive Bootcamp" },
    ],
    bullets: [
      "Client advisory consultation frameworks.",
      "Property negotiation and deal structuring.",
      "Regulatory compliance walk-throughs.",
      "Investment portfolio case presentations.",
    ],
  },
  {
    phase: "Phase 3",
    title: "Field Practicals",
    desc: "Supervised practical deployment: conduct physical property verifications, assist in advisory transactions, and submit a documented client advisory project.",
    meta: [
      { icon: Calendar, label: "Duration: 4–8 Weeks" },
      { icon: CheckCircle2, label: "Supervised Field Assessments" },
    ],
    bullets: [
      "Physical land and property verification.",
      "Assisted client advisory sessions.",
      "Market survey and valuation report writing.",
      "Final certification project submission.",
    ],
  },
];

function PhaseCard({ phase, title, desc, meta, bullets, colorClass }: {
  phase: string;
  title: string;
  desc: string;
  meta: { icon: React.ElementType; label: string }[];
  bullets: string[];
  colorClass: string;
}) {
  return (
    <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4">
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase ${colorClass}`}>
        {phase}
      </div>
      <h3 className="font-heading font-bold text-base text-text-main">{title}</h3>
      <p className="text-text-muted text-xs leading-relaxed">{desc}</p>
      <div className="flex flex-wrap gap-4 text-xs font-semibold text-text-muted pt-1">
        {meta.map((m, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <m.icon className="w-3.5 h-3.5 text-primary" />
            {m.label}
          </div>
        ))}
      </div>
      <ul className="space-y-2 pt-1">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2 text-xs text-text-muted">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Programs() {
  return (
    <PublicLayout>
      {/* Hero Header */}
      <section className="relative py-16 md:py-20 border-b border-border-main bg-bg-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(38,196,150,0.08),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-text-main">
            Training &amp; Programs
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
            Two distinct professional certification tracks. Choose the path that fits your real estate career: estate management or property advisory.
            Applications are open to one track at a time and require individual approval.
          </p>
        </div>
      </section>

      {/* Track Selector Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

        {/* Track 1: HCEM */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border-main pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-glow border border-primary/30 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-primary tracking-widest">Track 1</span>
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-text-main">
                  Housmata Certified Estate Manager
                </h2>
                <p className="text-xs text-text-muted mt-0.5">HCEM · Rent Management &amp; Property Operations</p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                href="/curriculum"
                className="btn border border-border-main text-text-muted hover:text-text-main hover:border-border-main-hover px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                View Curriculum
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/apply"
                className="btn bg-primary text-text-inverse hover:brightness-110 px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                 Apply for HCEM
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HCEM_PHASES.map((p) => (
              <PhaseCard
                key={p.phase}
                {...p}
                colorClass="bg-primary-glow border-primary/20 text-primary"
              />
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-bg-card border border-border-main text-xs text-text-muted leading-relaxed">
            <span className="font-bold text-text-main">Who is HCEM for?</span>&nbsp;
            Property managers, letting agents, and administrators who want to professionalize their estate management operations: handling rent collection, tenancy agreements, landlord-tenant relations, and facility upkeep.
          </div>
        </div>

        {/* Track 2: HCPA */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border-main pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-widest">Track 2</span>
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-text-main">
                  Housmata Certified Property Advisor
                </h2>
                <p className="text-xs text-text-muted mt-0.5">HCPA · Property Advisory, Verification &amp; Investment</p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                href="/curriculum/hcpa"
                className="btn border border-border-main text-text-muted hover:text-text-main hover:border-border-main-hover px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                View Curriculum
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/apply"
                className="btn bg-amber-500 text-white hover:brightness-110 px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                 Apply for HCPA
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HCPA_PHASES.map((p) => (
              <PhaseCard
                key={p.phase}
                {...p}
                colorClass="bg-amber-500/10 border-amber-500/30 text-amber-400"
              />
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-bg-card border border-border-main text-xs text-text-muted leading-relaxed">
            <span className="font-bold text-text-main">Who is HCPA for?</span>&nbsp;
            Sales agents, property consultants, and investors who want to advise clients on acquiring, selling, or investing in property: mastering due diligence, title verification, market valuation, and fraud prevention.
          </div>
        </div>

        {/* AI-Powered Learning Banner */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-glow/40 to-bg-card p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
            <div className="md:w-2/5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-text-inverse text-[0.7rem] font-extrabold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Assisted Training
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-text-main">
                Both Tracks Run on an AI Learning Engine
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Whichever path you choose, you train inside the same intelligent environment that helps you study faster and helps instructors and admissions act sooner.
              </p>
            </div>
            <div className="md:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: BookOpen, title: "AI Lesson Assistant", desc: "Summarize lessons and ask questions in plain English while you study." },
                { icon: CheckCircle2, title: "AI Answer Explanations", desc: "Understand exactly why each quiz answer is correct after you attempt it." },
                { icon: Award, title: "Smart Scorecard Insights", desc: "Get a personalized read on your grades and where to improve next." },
                { icon: UserCheck, title: "AI Application Screening", desc: "Admissions receive instant, structured recommendations on every applicant." },
                { icon: AlertTriangle, title: "At-Risk Detection", desc: "Automatic briefings flag slipping students with suggested interventions." },
                { icon: FileText, title: "AI Grading Support", desc: "Instructors draft consistent feedback in seconds, keeping the final call human." },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-bg-card border border-border-main">
                  <div className="w-9 h-9 rounded-lg bg-primary-glow text-primary flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-text-main text-xs">{f.title}</p>
                    <p className="text-text-muted text-[11px] leading-relaxed mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enrollment Rule Banner */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center space-y-3">
          <h3 className="text-sm font-heading font-extrabold text-text-main">
            One Track at a Time
          </h3>
          <p className="text-xs text-text-muted max-w-xl mx-auto leading-relaxed">
            Applicants may only enroll in <strong className="text-text-main">one certification track at a time</strong>.
            Each enrollment requires a fresh application and awaits individual admin approval.
            You may apply for the second track once you have completed or exited your current program.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center pt-4 space-y-4">
          <h3 className="text-lg font-heading font-bold text-text-main">Ready to Begin?</h3>
          <p className="text-text-muted text-xs max-w-sm mx-auto leading-relaxed">
            Apply for either track. Your application enters an admin review queue before enrollment is confirmed.
          </p>
          <div className="pt-2">
            <Link
              href="/apply"
              className="btn bg-primary text-text-inverse hover:brightness-110 px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2 transition-all"
            >
              Start Admission Application
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
