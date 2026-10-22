"use client";

import React from "react";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Home,
  TrendingUp,
  Award,
  UserCheck,
  AlertTriangle,
  FileText,
  ShieldAlert,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import {
  Button,
  SpotlightCard,
  ShimmerBadge,
} from "@/components/ui/hashicorp";

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
      "Ethics as an operating system (Rule-based funds)",
      "Structural property inspection checks",
      "Tenancy agreements and inventory sheet rules",
      "Negotiation and objection handling",
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
      "Listings control and digital property records",
      "Tenant KYC & scoring frameworks",
      "Landlord CRM and rent ledger management",
      "Maintenance board & document auto-generation",
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
      "In-person property inspections",
      "Live portfolio management tasks",
      "Structured field report documentation",
      "Final certification submission",
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
      "Property documentation & title verification",
      "Due diligence and land search procedures",
      "Market valuation and investment analysis",
      "Fraud detection and risk management",
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
      "Client advisory consultation frameworks",
      "Property negotiation and deal structuring",
      "Regulatory compliance walk-throughs",
      "Investment portfolio case presentations",
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
      "Physical land and property verification",
      "Assisted client advisory sessions",
      "Market survey and valuation report writing",
      "Final certification project submission",
    ],
  },
];

function PhaseCard({
  phase,
  title,
  desc,
  meta,
  bullets,
  variant,
}: {
  phase: string;
  title: string;
  desc: string;
  meta: { icon: React.ElementType; label: string }[];
  bullets: string[];
  variant: "hcem" | "hcpa";
}) {
  const isEmerald = variant === "hcem";
  return (
    <SpotlightCard
      variant={variant}
      radius="lg"
      className="p-6 bg-zinc-950 border-white/10 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between"
    >
      <div className="space-y-4">
        <ShimmerBadge variant={variant}>
          {phase}
        </ShimmerBadge>
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
        
        <div className="flex flex-wrap gap-3 text-xs font-mono text-zinc-400 pt-1">
          {meta.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <m.icon className={`w-3.5 h-3.5 ${isEmerald ? "text-product-hcem" : "text-[#a855f7]"}`} />
              <span>{m.label}</span>
            </div>
          ))}
        </div>

        <ul className="space-y-2 pt-2 border-t border-white/5">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-xs text-zinc-300">
              <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isEmerald ? "text-product-hcem" : "text-[#a855f7]"}`} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </SpotlightCard>
  );
}

export default function Programs() {
  return (
    <PublicLayout>
      <div className="bg-black text-white selection:bg-product-hcem/20 selection:text-product-hcem">
        {/* Hero Header */}
        <section className="relative py-20 md:py-28 border-b border-white/10 bg-black overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(2,184,117,0.08),transparent_50%)]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <ShimmerBadge variant="default" dot className="mb-4">
              Formal Accreditation Pathways
            </ShimmerBadge>
            <h1 className="text-display-lg font-bold tracking-tight text-white max-w-3xl mx-auto">
              Operator-Grade Real Estate Curriculums
            </h1>
            <p className="text-body-lg text-zinc-400 max-w-2xl mx-auto mt-4 leading-relaxed">
              Two distinct professional certification pathways. Choose the specialty that aligns with your real estate career: estate management operations or title verification and advisory.
            </p>
          </div>
        </section>

        {/* Track Selector Grid */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

          {/* Track 1: HCEM */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-product-hcem/10 border border-product-hcem/30 flex items-center justify-center text-product-hcem">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-eyebrow text-product-hcem font-mono">TRACK 01 // OPERATIONS</span>
                  <h2 className="text-2xl font-bold text-white mt-0.5">
                    Housmata Certified Estate Manager (HCEM)
                  </h2>
                  <p className="text-xs text-zinc-400">Rent Governance · Lease Law · Portfolio Operations</p>
                </div>
              </div>
              <div className="flex gap-2.5 flex-shrink-0">
                <Button variant="secondary" size="sm" href="/curriculum" icon={<ChevronRight className="w-3.5 h-3.5" />}>
                  View Syllabus
                </Button>
                <Button variant="hcem" size="sm" href="/apply" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Apply for HCEM
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HCEM_PHASES.map((p) => (
                <PhaseCard
                  key={p.phase}
                  {...p}
                  variant="hcem"
                />
              ))}
            </div>

            <div className="p-4 rounded-lg bg-zinc-950 border border-white/10 text-xs text-zinc-400 leading-relaxed">
              <strong className="text-white">Target Operational Profile:</strong>&nbsp;
              Property managers, letting agents, and facility custodians seeking to professionalize and standardize rent collection, statutory tenancy agreements, dispute mediation, and computerized utility accounting.
            </div>
          </div>

          {/* Track 2: HCPA */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-product-hcpa/10 border border-product-hcpa/30 flex items-center justify-center text-[#a855f7]">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-eyebrow text-[#a855f7] font-mono">TRACK 02 // ADVISORY</span>
                  <h2 className="text-2xl font-bold text-white mt-0.5">
                    Housmata Certified Property Advisor (HCPA)
                  </h2>
                  <p className="text-xs text-zinc-400">Title Search · Coordinate Charting · Land Banking Due Diligence</p>
                </div>
              </div>
              <div className="flex gap-2.5 flex-shrink-0">
                <Button variant="secondary" size="sm" href="/curriculum/hcpa" icon={<ChevronRight className="w-3.5 h-3.5" />}>
                  View Syllabus
                </Button>
                <Button variant="hcpa" size="sm" href="/apply" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Apply for HCPA
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HCPA_PHASES.map((p) => (
                <PhaseCard
                  key={p.phase}
                  {...p}
                  variant="hcpa"
                />
              ))}
            </div>

            <div className="p-4 rounded-lg bg-zinc-950 border border-white/10 text-xs text-zinc-400 leading-relaxed">
              <strong className="text-white">Target Operational Profile:</strong>&nbsp;
              Sales agents, land investment consultants, and legal searchers advising clients on land acquisitions: mastering root of title searches, surveyor coordinate plotting, forest reserve exclusions, and gazette compliance.
            </div>
          </div>

          {/* AI-Powered Learning Specification */}
          <SpotlightCard
            variant="hcem"
            radius="xl"
            className="p-8 md:p-10 bg-zinc-950 border-white/10 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
              <div className="md:w-2/5 space-y-4">
                <ShimmerBadge variant="waypoint" dot>
                  Cognitive Engine
                </ShimmerBadge>
                <h3 className="text-2xl font-bold text-white">
                  Intelligent Operator Console
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Both tracks run on our proprietary AI learning engine. Accelerate lesson comprehension, obtain instant quiz rationales, and receive granular rubric scoring.
                </p>
              </div>
              <div className="md:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: BookOpen, title: "AI Statutory Tutor", desc: "Ask questions directly against Nigerian real estate handbooks." },
                  { icon: CheckCircle2, title: "Instant Quiz Rationales", desc: "Explanations for every quiz answer reinforce core statutes." },
                  { icon: Award, title: "Rubric Scorecard", desc: "Personalized breakdown across 10 operational pillars." },
                  { icon: UserCheck, title: "Admissions Screening", desc: "Instant qualification profiling ensures cohort readiness." },
                  { icon: AlertTriangle, title: "At-Risk Telemetry", desc: "Automatic faculty briefings flag slipping trainees early." },
                  { icon: FileText, title: "Grading Copilot", desc: "Assists faculty to deliver consistent, structured feedback." },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-lg bg-zinc-900/50 border border-white/5">
                    <div className="w-8 h-8 rounded-md bg-white/5 text-product-hcem flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-xs">{f.title}</div>
                      <div className="text-zinc-400 text-[11px] leading-relaxed mt-0.5">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SpotlightCard>

          {/* Enrollment Rule Banner */}
          <div className="rounded-lg border border-product-vault/20 bg-product-vault/[0.04] p-5 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-product-vault font-semibold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              Single Active Track Policy
            </div>
            <p className="text-xs text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Trainees may only enroll in <strong className="text-white">one certification track at a time</strong>.
              Upon completing or exiting your current track, you may submit a subsequent admission application for the secondary pathway.
            </p>
          </div>

          {/* Bottom CTA */}
          <div className="text-center pt-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Begin Your Admission Evaluation</h3>
            <p className="text-zinc-400 text-xs max-w-sm mx-auto leading-relaxed">
              Select your track and submit credentials. The admissions board convenes weekly to review applicants.
            </p>
            <div className="pt-2">
              <Button variant="primary" size="lg" href="/apply" icon={<ArrowRight className="w-4 h-4" />}>
                Start Admission Application
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
