"use client";

import React, { useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Landmark,
  BookOpen,
  Check,
  Home as HomeIcon,
  TrendingUp,
  Sparkles,
  Award,
  UserCheck,
  AlertTriangle,
  FileText,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import {
  Button,
  SpotlightCard,
  ShimmerBadge,
  SectionHeader,
  HairlineDivider,
  MagneticButton,
  RollingNumber,
} from "@/components/ui/hashicorp";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  const levels = [
    {
      num: "01",
      name: "Digital Property Management Operator",
      eyebrow: "LEVEL 01 FOUNDATION",
      desc: "Standardization of listing data, KYC identity verification, tenant digital onboarding, and inventory audit logs.",
      badge: "Operator Ground",
    },
    {
      num: "02",
      name: "Certified Estate Manager / Advisor",
      eyebrow: "LEVEL 02 PROFESSIONAL",
      desc: "Portfolio rent collection governance, tenancy agreement drafting, Land Use Act compliance, and maintenance ticket telemetry.",
      badge: "HCEM / HCPA",
    },
    {
      num: "03",
      name: "Verified Independent Property Consultant",
      eyebrow: "LEVEL 03 SPECIALIST",
      desc: "Lands registry charting, surveyor coordinate vetting, forest-reserve exclusion searches, and institutional property advisory.",
      badge: "Title Consultant",
    },
    {
      num: "04",
      name: "Housmata Partner Agency",
      eyebrow: "LEVEL 04 ENTERPRISE",
      desc: "Full operational credentials to scale estate management branches and portfolio hubs using the Housmata infrastructure backend.",
      badge: "Agency Director",
    },
  ];

  return (
    <PublicLayout>
      <div ref={containerRef} className="relative overflow-hidden bg-black text-white selection:bg-product-hcem/20 selection:text-product-hcem">
        {/* Subtle Ambient Background Lighting (Preserving Brand Emerald & Sovereign Violet) */}
        <div className="absolute top-[3%] left-[15%] w-[45vw] h-[45vw] rounded-full bg-product-hcem/[0.04] blur-[150px] pointer-events-none" />
        <div className="absolute top-[28%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-product-hcpa/[0.05] blur-[160px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[8%] w-[50vw] h-[50vw] rounded-full bg-product-hcem/[0.03] blur-[180px] pointer-events-none" />

        {/* Technical Coordinate Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40" />

        {/* 1. HERO SECTION — Engineered Display Architecture */}
        <section className="relative pt-24 pb-28 md:pt-36 md:pb-36 border-b border-white/10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Mission Pitch & CTAs */}
              <div className="lg:col-span-7 space-y-7 text-left">
                <div className="flex flex-wrap items-center gap-2.5">
                  <ShimmerBadge variant="hcem" dot>
                    Operator-Grade Property Education
                  </ShimmerBadge>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
                    {"// NG REAL ESTATE INFRASTRUCTURE"}
                  </span>
                </div>

                <h1 className="text-display-xl font-bold tracking-tight text-white leading-[1.08] text-balance">
                  We engineer <br />
                  <span className="text-product-hcem underline decoration-product-hcem/30 decoration-wavy underline-offset-8">
                    system-backed
                  </span>{" "}
                  real estate operators.
                </h1>

                <p className="text-body-lg text-zinc-400 max-w-xl leading-relaxed">
                  Transform informal property habits into institutional precision. Master rent cycle collection, C of O verification, GPS coordinate charting, and digital tenancy mediation inside an AI-assisted operational console.
                </p>

                {/* 8px Engineered HashiCorp CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <MagneticButton
                    variant="primary"
                    size="lg"
                    href="/apply"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Start Admission Form
                  </MagneticButton>
                  <Button
                    variant="secondary"
                    size="lg"
                    href="/programs"
                  >
                    Compare Tracks &amp; Curriculums
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    href="/verify"
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Verify Credential
                  </Button>
                </div>

                {/* Micro Brand Endorsement */}
                <div className="pt-4 flex items-center gap-4 text-xs text-zinc-500 font-mono">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <ShieldCheck className="w-4 h-4 text-product-hcem" />
                    <span>Property Max Results Certified</span>
                  </div>
                  <span>•</span>
                  <span>Land Use Act 1978 Standardized</span>
                </div>
              </div>

              {/* Right Column: High-Focus Command Console Graphic */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
                <SpotlightCard
                  variant="hcem"
                  radius="xl"
                  className="w-full max-w-[440px] bg-zinc-950/80 border-white/10 p-6 backdrop-blur-xl shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                      <span className="text-[11px] font-mono text-zinc-500 pl-1">runtime.housmata.lms</span>
                    </div>
                    <ShimmerBadge variant="waypoint" dot>
                      Active Cohort 04
                    </ShimmerBadge>
                  </div>

                  <div className="space-y-4">
                    {/* Active Track Spec */}
                    <div className="p-4 rounded-lg bg-zinc-900/60 border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                        <span>OPERATOR CERTIFICATION</span>
                        <span className="text-product-hcem font-bold">LIVE TELEMETRY</span>
                      </div>
                      <div className="text-base font-semibold text-white">
                        Housmata Certified Estate Manager (HCEM)
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                        <span>Cohort Progress</span>
                        <span className="font-mono text-white font-semibold">68%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-product-hcem rounded-full w-[68%] shadow-[0_0_8px_#02b875]" />
                      </div>
                    </div>

                    {/* Operational Rubric Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-white/5">
                        <div className="text-[10px] font-mono text-zinc-500 uppercase">QUIZ BENCHMARK</div>
                        <div className="text-xl font-bold font-mono text-white mt-0.5">
                          <RollingNumber value={94} suffix="%" />
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">Passing: 75%+</div>
                      </div>
                      <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-white/5">
                        <div className="text-[10px] font-mono text-zinc-500 uppercase">SUBMISSIONS</div>
                        <div className="text-xl font-bold font-mono text-product-hcem mt-0.5">
                          8 <span className="text-xs text-zinc-500 font-normal">/ 10 Done</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">PDF Audits Validated</div>
                      </div>
                    </div>

                    {/* AI Verification Indicator */}
                    <div className="p-3.5 rounded-lg bg-product-hcem/[0.04] border border-product-hcem/20 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-product-hcem/20 flex items-center justify-center text-product-hcem flex-shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-white">AI Real Estate Tutor Active</div>
                        <div className="text-zinc-400 text-[11px]">Instant statutory breakdown for Land Use Act Section 5</div>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </div>

            </div>
          </div>
        </section>

        {/* 2. TELEMETRY MARQUEE — High-Frequency Numbers */}
        <section className="py-12 border-b border-white/10 bg-zinc-950/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-1">
                <div className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">
                  CERTIFIED OPERATORS
                </div>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-white">
                  <RollingNumber value={1480} suffix="+" />
                </div>
                <div className="text-xs text-zinc-400">Active throughout Nigeria</div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">
                  TITLE VERIFICATION ACCURACY
                </div>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-product-hcem">
                  <RollingNumber value={99.8} decimals={1} suffix="%" />
                </div>
                <div className="text-xs text-zinc-400">Zero forest reserve overlap</div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">
                  MANAGED ASSET VALUE
                </div>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-white">
                  ₦<RollingNumber value={4} suffix=".2B+" />
                </div>
                <div className="text-xs text-zinc-400">Portfolio under governance</div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">
                  STATUTORY COMPLIANCE
                </div>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-product-vault">
                  <RollingNumber value={100} suffix="%" />
                </div>
                <div className="text-xs text-zinc-400">Governor&apos;s Consent protocol</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. DUAL CHROMATIC PRODUCT SHOWCASE (HCEM vs HCPA) */}
        <section className="py-24 border-b border-white/10 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              align="center"
              eyebrow="SELECT YOUR PROFESSIONAL OPERATIONAL TRACK"
              eyebrowColor="hcem"
              title="Two Specialized Certification Pathways"
              description="Trainees specialize in one core discipline at a time. Each pathway combines self-paced statutory theory, live sandbox masterclasses, and practical document submissions."
              className="mb-16"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Product 1: HCEM (Housmata Emerald #02b875) */}
              <SpotlightCard
                variant="hcem"
                radius="xl"
                className="p-8 sm:p-10 bg-zinc-950 border-white/10 hover:border-product-hcem/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-lg bg-product-hcem/10 border border-product-hcem/30 flex items-center justify-center text-product-hcem">
                      <HomeIcon className="w-6 h-6" />
                    </div>
                    <ShimmerBadge variant="hcem">
                      Track A // Operations
                    </ShimmerBadge>
                  </div>

                  <div>
                    <span className="text-eyebrow text-product-hcem font-mono">RENT MANAGEMENT &amp; OPERATIONS</span>
                    <h3 className="text-card-title text-white font-bold mt-1">
                      Housmata Certified Estate Manager (HCEM)
                    </h3>
                  </div>

                  <p className="text-body-sm text-zinc-400 leading-relaxed">
                    Designed for property managers, letting agents, and facility custodians. Focuses on daily rent collection cycles, structured tenancy agreements, tenant-landlord dispute mediation, vendor ticket dispatch, and computerized utility accounting.
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {[
                      "Tenancy Agreement Drafting under State Tenancy Laws",
                      "Automated Rent Roll & Late Penalty Enforcement",
                      "Move-in/Move-out Photographic Inventory Audits",
                      "Preventive Facility Maintenance Ticketing",
                    ].map((spec, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <Check className="w-4 h-4 text-product-hcem flex-shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-white/10 flex items-center justify-between gap-4">
                  <Button variant="ghost" size="sm" href="/curriculum">
                    View Syllabus
                  </Button>
                  <Button variant="hcem" size="sm" href="/apply">
                    Apply for HCEM
                  </Button>
                </div>
              </SpotlightCard>

              {/* Product 2: HCPA (Sovereign Violet #7b42bc) */}
              <SpotlightCard
                variant="hcpa"
                radius="xl"
                className="p-8 sm:p-10 bg-zinc-950 border-white/10 hover:border-product-hcpa/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-lg bg-product-hcpa/10 border border-product-hcpa/30 flex items-center justify-center text-[#a855f7]">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <ShimmerBadge variant="hcpa">
                      Track B // Advisory
                    </ShimmerBadge>
                  </div>

                  <div>
                    <span className="text-eyebrow text-[#a855f7] font-mono">PROPERTY ADVISORY &amp; VERIFICATION</span>
                    <h3 className="text-card-title text-white font-bold mt-1">
                      Housmata Certified Property Advisor (HCPA)
                    </h3>
                  </div>

                  <p className="text-body-sm text-zinc-400 leading-relaxed">
                    Designed for independent real estate consultants, investment scouts, and sales advisors. Focuses on root of title searches, surveyor coordinate charting, forest reserve exclusion checks, and land banking due diligence.
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {[
                      "Survey Plan Plotting (UTM Minna / WGS84 Datum)",
                      "Certificate of Occupancy (C of O) & Governor's Consent Trace",
                      "Gazette & Excision Verification at State Lands Bureau",
                      "Institutional Land Banking & Capital Yield Modeling",
                    ].map((spec, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <Check className="w-4 h-4 text-[#a855f7] flex-shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-white/10 flex items-center justify-between gap-4">
                  <Button variant="ghost" size="sm" href="/curriculum/hcpa">
                    View Syllabus
                  </Button>
                  <Button variant="hcpa" size="sm" href="/apply">
                    Apply for HCPA
                  </Button>
                </div>
              </SpotlightCard>

            </div>
          </div>
        </section>

        {/* 4. REPLACING INFORMAL HABITS — Enterprise Real Estate Reality */}
        <section className="py-24 border-b border-white/10 bg-zinc-950/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <SectionHeader
                  eyebrow="RISK MITIGATION FRAMEWORK"
                  title="Replacing Informal Habits with Software & Legal Structure"
                  description="Property losses in Nigeria rarely stem from a lack of capital. They occur when transactions rely on verbal agreements, un-charted survey beacons, and un-reconciled client funds."
                />

                <div className="space-y-4 pt-2">
                  {[
                    {
                      title: "Strict Coordinate Verification Protocol",
                      desc: "Mandates beacon coordinate plotting before client funds are escrowed, preventing uncommitted acquisition disputes.",
                    },
                    {
                      title: "Standardized Statutory Tenancy Documentation",
                      desc: "Converts customary handshake leases into enforceable legal deeds with explicit repair covenants and notice intervals.",
                    },
                    {
                      title: "Transparent Cloud Accounting",
                      desc: "Automates tenant service-charge apportionment and utility pass-throughs, eliminating personal fund co-mingling.",
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 p-4 rounded-lg bg-zinc-900/40 border border-white/5">
                      <CheckCircle2 className="w-5 h-5 text-product-hcem flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-white">{item.title}</div>
                        <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <SpotlightCard
                  variant="vault"
                  radius="xl"
                  className="p-8 bg-zinc-950 border-white/10 space-y-6"
                >
                  <div className="flex items-center gap-2.5 text-product-vault font-semibold text-sm">
                    <Landmark className="w-5 h-5" />
                    <span>Property Max Results Institutional Custodianship</span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Designed and directed by <strong>Property Max Results Ltd</strong>, a premier Nigerian real estate training and asset management institution. Handbooks and assessment rubrics are curated directly by seasoned counsel and registered surveyors.
                  </p>

                  <HairlineDivider variant="subtle" />

                  <div className="space-y-3">
                    <div className="text-[11px] font-mono text-zinc-500 uppercase">ACCREDITATION BADGE</div>
                    <div className="p-4 rounded-md bg-zinc-900/70 border border-white/10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-product-vault/20 flex items-center justify-center font-bold text-product-vault">
                        LMS
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-white">Central Graduate Registry</div>
                        <div className="text-zinc-500 text-[11px]">Instant verifiable employer search via QR code</div>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </div>

            </div>
          </div>
        </section>

        {/* 5. AI ENGINE SPECIFICATION */}
        <section className="py-24 border-b border-white/10 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              align="center"
              eyebrow="INTELLIGENT LEARNING ENVIRONMENT"
              eyebrowColor="waypoint"
              title="Engineered with Built-In Cognitive Assistance"
              description="Every candidate works within a purpose-built AI environment. Accelerate comprehension of dense statutory statutes, clarify quiz rationales, and receive immediate rubric feedback."
              className="mb-16"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: BookOpen,
                  title: "AI Statutory Assistant",
                  desc: "Ask questions directly against Nigerian real estate handbooks and statutory regulations during active lesson reading.",
                  color: "text-product-hcem bg-product-hcem/10 border-product-hcem/20",
                },
                {
                  icon: CheckCircle2,
                  title: "Instant Quiz Explanations",
                  desc: "Receive conversational yet legally rigorous rationales for every quiz question, reinforcing core concepts immediately.",
                  color: "text-product-hcem bg-product-hcem/10 border-product-hcem/20",
                },
                {
                  icon: Award,
                  title: "Adaptive Competency Scorecard",
                  desc: "Analyzes assignment sub-scores across the 10 Nigerian operational pillars, highlighting precise areas for improvement.",
                  color: "text-product-vault bg-product-vault/10 border-product-vault/20",
                },
                {
                  icon: UserCheck,
                  title: "Admissions Screening",
                  desc: "Structured qualification appraisal evaluates incoming candidates to ensure cohort readiness and integrity.",
                  color: "text-product-hcpa bg-product-hcpa/10 border-product-hcpa/20",
                },
                {
                  icon: AlertTriangle,
                  title: "At-Risk Telemetry",
                  desc: "Automated early-warning triggers alert instructors to struggling trainees before certification benchmarks lapse.",
                  color: "text-product-consul bg-product-consul/10 border-product-consul/20",
                },
                {
                  icon: FileText,
                  title: "Rubric Grading Copilot",
                  desc: "Empowers faculty to draft granular, consistent evaluation feedback while maintaining human verdict finality.",
                  color: "text-product-waypoint bg-product-waypoint/10 border-product-waypoint/20",
                },
              ].map((item, idx) => (
                <SpotlightCard
                  key={idx}
                  radius="lg"
                  className="p-6 bg-zinc-950 border-white/10 space-y-4 hover:border-white/20 transition-all"
                >
                  <div className={`w-10 h-10 rounded-md border flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* 6. FOUR-TIER OPERATOR HIERARCHY */}
        <section className="py-24 border-b border-white/10 bg-zinc-950/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              align="center"
              eyebrow="PROGRESSION SPECIFICATION"
              eyebrowColor="vault"
              title="The Four-Tier Operator Ladder"
              description="A clear credential progression establishing your formal operational authority from candidate trainee to enterprise agency partner."
              className="mb-16"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {levels.map((lvl) => (
                <SpotlightCard
                  key={lvl.num}
                  radius="lg"
                  className="p-6 bg-zinc-950 border-white/10 flex flex-col justify-between space-y-5 hover:border-product-hcem/40 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-bold text-white/20">{lvl.num}</span>
                      <ShimmerBadge variant="default">
                        {lvl.badge}
                      </ShimmerBadge>
                    </div>

                    <span className="text-[10px] font-mono text-product-hcem uppercase tracking-wider block">
                      {lvl.eyebrow}
                    </span>

                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {lvl.name}
                    </h3>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {lvl.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">VERIFIED STATUS</span>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* 7. ACADEMIC DIRECTOR SPECIFICATION */}
        <section className="py-24 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SpotlightCard
              variant="hcem"
              radius="2xl"
              className="max-w-4xl mx-auto p-8 sm:p-12 bg-zinc-950 border-white/10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              <div className="md:col-span-4 flex justify-center">
                <div className="w-44 h-44 rounded-xl bg-gradient-to-br from-product-hcem to-product-hcpa flex items-center justify-center font-bold text-black text-5xl shadow-2xl">
                  AA
                </div>
              </div>

              <div className="md:col-span-8 space-y-4 text-center md:text-left">
                <div>
                  <ShimmerBadge variant="hcem" dot className="mb-2">
                    Course Director
                  </ShimmerBadge>
                  <h3 className="text-2xl font-bold text-white">
                    Akinwunmi Awoyode
                  </h3>
                  <div className="text-xs font-mono text-product-hcem uppercase tracking-wider mt-0.5">
                    Managing Director &amp; CEO, Property Max Results Ltd.
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Recognised by <em>The Guardian Nigeria</em> as one of the visionary CEOs shaping the economic landscape. Holding an MSc in Real Estate Management &amp; Investment from Edinburgh Napier University, UK, and an MBA from the University of South Wales, UK, he directs the academic standards of Housmata training handbook.
                </p>

                <div className="pt-2">
                  <Button variant="outline" size="sm" href="/instructors">
                    View Faculty &amp; Credentials
                  </Button>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </section>

        {/* 8. BOTTOM CTA BANNER — Surface-1 24px Radius Container */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="rounded-2xl p-10 sm:p-16 bg-surface-1 border border-white/10 space-y-6 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,184,117,0.1),transparent_60%)] pointer-events-none" />

              <ShimmerBadge variant="hcem" dot>
                Admissions Open // Next Cohort
              </ShimmerBadge>

              <h2 className="text-display-lg font-bold tracking-tight text-white max-w-2xl mx-auto text-balance">
                Accelerate Your Real Estate Operator Career
              </h2>

              <p className="text-body-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
                Admissions board reviews applications weekly. Selected candidates are inducted into active cohort tracks with immediate access to self-paced modules, AI tutoring, and live masterclass sandboxes.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Button variant="secondary" size="lg" href="/programs">
                  Compare Program Tracks
                </Button>
                <MagneticButton
                  variant="primary"
                  size="lg"
                  href="/apply"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Access Application Form
                </MagneticButton>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
