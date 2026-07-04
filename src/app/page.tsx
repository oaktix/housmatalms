"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Landmark, Users, BarChart3, Sparkles, Check } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    const sections = document.querySelectorAll(".scroll-section");
    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const cards = containerRef.current.getElementsByClassName("premium-card");
    for (const card of Array.from(cards) as HTMLElement[]) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    }
  };

  const benefits = [
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Data & Data Integrity",
      desc: "Learn to build verified property listings and avoid the fake listing trap that plagues 60%+ of Nigerian listings.",
    },
    {
      icon: <Landmark className="w-6 h-6 text-primary" />,
      title: "Standardized Operations",
      desc: "Master the tenant onboarding lifecycle, tenant profiling, KYC checkmarks, and landlord relations mapping.",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
      title: "Financial Lifecycle Systems",
      desc: "Learn rent collection cycles, basic property accounting, receipts administration, and default escalation procedures.",
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Client Acquisition Funnels",
      desc: "Go beyond theoretical property marketing to create high-performing listing content and lead pipelines.",
    },
  ];

  const levels = [
    {
      num: 1,
      name: "Digital Property Management Operator",
      desc: "Core competence in digital listing standardisation, KYC verifications, and property documentation.",
    },
    {
      num: 2,
      name: "Certified Estate Manager",
      desc: "Proficient in managing cohort portfolios, service vendors, maintenance tickets, and collection audits.",
    },
    {
      num: 3,
      name: "Verified Independent Property Consultant",
      desc: "Capable of mapping complex landlord database structures, advising on asset value, and onboarding multi-unit assets.",
    },
    {
      num: 4,
      name: "Housmata Partner Agency",
      desc: "Full operational credentials to scale estate management franchises using the Housmata platform backend.",
    },
  ];

  return (
    <PublicLayout>
      <div ref={containerRef} onMouseMove={handleMouseMove} className="relative overflow-hidden bg-bg-main selection:bg-primary/30 selection:text-text-main">
        {/* Ambient Moving Background Lights across the whole landing page */}
        <div className="absolute top-[5%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-primary/8 blur-[130px] animate-pulse-slow pointer-events-none" />
        <div className="absolute top-[30%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-secondary/8 blur-[160px] animate-pulse-slow pointer-events-none [animation-delay:3s]" />
        <div className="absolute bottom-[25%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-primary/8 blur-[180px] animate-pulse-slow pointer-events-none [animation-delay:6s]" />

        {/* 1. Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-36 md:pt-44 md:pb-48 border-b border-border-main scroll-section transition-all duration-1000">
          {/* High-quality Animated Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(2,184,117,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,184,117,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(2,184,117,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,184,117,0.05)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] animate-grid-move pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-main/40 to-bg-main pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              {/* Left Hero Details */}
              <div className="lg:col-span-7 space-y-8 text-left transition-all duration-700 transform translate-y-4 opacity-0 [animation-fill-mode:forwards] animate-slide-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-glow border border-primary/20 text-primary text-[0.7rem] font-extrabold uppercase tracking-widest shadow-[0_4px_20px_rgba(2,184,117,0.08)]">
                  <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                  Housmata Verified Operator Program
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-black tracking-tight leading-[0.98] text-text-main text-wrap-balance">
                  We train <br className="hidden md:inline" />
                  <span className="text-primary font-black relative inline-block">
                    system-backed
                    <span className="absolute left-0 bottom-2 h-4 w-full bg-primary-glow/60 -z-10 rounded-full" />
                  </span> <br />
                  estate managers
                </h1>
                <p className="text-text-muted text-base sm:text-lg max-w-xl leading-relaxed">
                  This is not a generic real estate theory course. It is an operational training system designed to produce competent digital estate professionals who run structured workflows.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link
                    href="/apply"
                    className="btn bg-primary text-text-inverse hover:brightness-110 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-glow hover:shadow-[0_0_30px_rgba(2,184,117,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Apply to Academy
                    <ArrowRight className="w-4.5 h-4.5" />
                  </Link>
                  <Link
                    href="/programs"
                    className="btn border border-border-main bg-bg-card/40 backdrop-blur-sm hover:bg-bg-card-hover text-text-main px-8 py-4 rounded-xl font-bold flex items-center justify-center transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Explore Programs
                  </Link>
                </div>
              </div>
 
              {/* Right Hero Interactive Interface Graphic */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end w-full relative transition-all duration-1000 delay-200 transform translate-y-8 opacity-0 [animation-fill-mode:forwards] animate-slide-up">
                <div className="absolute -inset-6 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-[3rem] blur-3xl opacity-50 animate-pulse-slow" />
                <div className="relative w-full max-w-[420px] rounded-2xl premium-card glass p-6 border-border-main z-10 shadow-[0_30px_80px_rgba(0,0,0,0.25)] hover:border-primary/50 group transition-all duration-500">
                  <div className="flex items-center justify-between border-b border-border-main/50 pb-4 mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="text-[0.65rem] uppercase tracking-wider font-extrabold text-primary bg-primary-glow px-2.5 py-1 rounded-md">
                      Live Academy Portal
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-bg-main/50 border border-border-main/60 flex items-center justify-between">
                      <div>
                        <div className="text-[0.6rem] text-text-muted uppercase tracking-wider font-black">Active Cohort</div>
                        <div className="text-sm font-bold text-text-main">Phase 1 Foundation</div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-primary-glow flex items-center justify-center text-primary font-black text-xs">
                        8W
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-bg-main/50 border border-border-main/60 space-y-2">
                      <div className="flex justify-between items-center text-[0.6rem] text-text-muted uppercase tracking-wider font-black">
                        <span>Checklist Milestones</span>
                        <span className="text-primary">75% Complete</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-text-main">
                          <Check className="w-3.5 h-3.5 text-primary" />
                          <span>Pre-Course Competency Survey</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-text-main">
                          <Check className="w-3.5 h-3.5 text-primary" />
                          <span>Standardized Operations Quiz</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                          <div className="w-3.5 h-3.5 rounded-full border border-border-main flex-shrink-0" />
                          <span>Final Certification Harvest</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1 p-3.5 rounded-xl bg-bg-main/30 border border-border-main/40 text-center">
                        <div className="text-[0.55rem] text-text-muted uppercase tracking-wider font-black">Graduates</div>
                        <div className="text-lg font-black text-primary">1,240+</div>
                      </div>
                      <div className="flex-1 p-3.5 rounded-xl bg-bg-main/30 border border-border-main/40 text-center">
                        <div className="text-[0.55rem] text-text-muted uppercase tracking-wider font-black">Employment</div>
                        <div className="text-lg font-black text-secondary">94.2%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Academy Overview */}
        <section className="py-28 border-b border-border-main bg-bg-card relative scroll-section transition-all duration-1000 opacity-0 translate-y-12 [&.section-visible]:opacity-100 [&.section-visible]:translate-y-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-20 transition-all duration-700 delay-100">
              <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-text-main text-wrap-balance">
                The Mission of Housmata Academy
              </h2>
              <div className="h-1.5 w-16 bg-primary mx-auto rounded-full" />
              <p className="text-text-muted leading-relaxed text-wrap-pretty text-base">
                We exist to solve the biggest problem in property management: a lack of transparency, structure, and accountability. Our trainees graduate not as salespeople chasing a commission, but as custodians of trust.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7 space-y-8 transition-all duration-700 delay-200">
                <h3 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-text-main text-wrap-balance">
                  Replacing Informal Habits with Structured Systems
                </h3>
                <p className="text-text-muted leading-relaxed text-base">
                  In the real estate sector, disputes rarely arise from a lack of opportunities. They stem from poor documentation, hidden property defects, unauthorized co-mingling of landlord funds, and verbal agreements with no audit trail.
                </p>
                <div className="space-y-4">
                  {[
                    "Enforces property data standardisation.",
                    "Systematizes tenant screening and KYC verifications.",
                    "Digitalizes inspections, maintenance logs, and financial flows.",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3.5">
                      <CheckCircle2 className="w-5.5 h-5.5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text-main text-sm font-semibold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD CONTRAST: Uses bg-bg-main on bg-bg-card section so it pops out */}
              <div className="lg:col-span-5 premium-card rounded-2xl p-8 bg-bg-main border-border-main/80 space-y-8 relative shadow-lg shadow-black/5 transition-all duration-700 delay-300">
                <div className="font-heading font-extrabold text-lg text-text-main flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-primary" />
                  Under the Auspices of Property Max
                </div>
                <p className="text-text-muted text-xs sm:text-sm leading-relaxed text-wrap-pretty">
                  Housmata Academy is designed and directed by <strong>Property Max Results Ltd</strong>, a leading real estate training and management institution shaping Nigeria&apos;s economic landscape. Our certifications are backed by industry credibility.
                </p>
                <div className="p-4.5 rounded-xl bg-bg-card border border-border-main flex items-center gap-4.5">
                  <div className="w-12 h-12 rounded-xl bg-primary-glow flex items-center justify-center font-heading font-extrabold text-primary flex-shrink-0">
                    L1
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-text-main">Ready-for-Deployment Network</p>
                    <p className="text-text-muted mt-0.5 leading-relaxed">Graduates enter our tracking database for immediate career status management.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Program Benefits - Asymmetrical Cards Grid */}
        <section className="py-28 border-b border-border-main scroll-section transition-all duration-1000 opacity-0 translate-y-12 [&.section-visible]:opacity-100 [&.section-visible]:translate-y-0 bg-bg-main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-20 transition-all duration-700 delay-100">
              <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-text-main text-wrap-balance">
                Why Join Housmata Academy?
              </h2>
              <div className="h-1.5 w-16 bg-primary mx-auto rounded-full" />
              <p className="text-text-muted leading-relaxed text-wrap-pretty text-base">
                We teach you how modern, digital real estate systems actually function in practice. Learn standard methodologies, get tested in a sandbox environment, and earn a public-verifiable certificate.
              </p>
            </div>

            {/* CARD CONTRAST: Uses bg-bg-card on bg-bg-main section to stand out perfectly */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((b, i) => (
                <div 
                  key={i} 
                  className="premium-card rounded-2xl p-7 bg-bg-card border-border-main flex flex-col gap-5 group transition-all duration-500 shadow-md hover:-translate-y-1.5"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-glow flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    {b.icon}
                  </div>
                  <h3 className="font-heading font-bold text-lg tracking-tight text-text-main">
                    {b.title}
                  </h3>
                  <p className="text-text-muted text-xs leading-relaxed flex-grow text-wrap-pretty">
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Certification Pathway */}
        <section className="py-28 border-b border-border-main bg-bg-card scroll-section transition-all duration-1000 opacity-0 translate-y-12 [&.section-visible]:opacity-100 [&.section-visible]:translate-y-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-20 transition-all duration-700 delay-100">
              <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-text-main text-wrap-balance">
                The Certification Ladder
              </h2>
              <div className="h-1.5 w-16 bg-primary mx-auto rounded-full" />
              <p className="text-text-muted leading-relaxed text-wrap-pretty text-base">
                Four levels of verification structured to advance you from trainee operator to an independent real estate agency owner.
              </p>
            </div>

            {/* CARD CONTRAST: Uses bg-bg-main on bg-bg-card section to stand out perfectly */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {levels.map((lvl) => (
                <div 
                  key={lvl.num} 
                  className="premium-card rounded-2xl p-7 bg-bg-main border-border-main relative flex flex-col gap-5 transition-all duration-500 shadow-md hover:-translate-y-1.5"
                >
                  <div className="absolute top-4 right-4 font-heading font-black text-5xl text-primary/5 select-none transition-colors group-hover:text-primary/10">
                    0{lvl.num}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary text-text-inverse font-heading font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/20">
                    LVL {lvl.num}
                  </div>
                  <h3 className="font-heading font-bold text-base tracking-tight text-text-main mt-1">
                    {lvl.name}
                  </h3>
                  <p className="text-text-muted text-xs leading-relaxed flex-grow text-wrap-pretty">
                    {lvl.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Instructor Highlights */}
        <section className="py-28 border-b border-border-main scroll-section transition-all duration-1000 opacity-0 translate-y-12 [&.section-visible]:opacity-100 [&.section-visible]:translate-y-0 bg-bg-main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-20 transition-all duration-700 delay-100">
              <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-text-main">
                Course Director
              </h2>
              <div className="h-1.5 w-16 bg-primary mx-auto rounded-full" />
            </div>

            {/* CARD CONTRAST: Uses bg-bg-card on bg-bg-main section to stand out perfectly */}
            <div className="max-w-4xl mx-auto premium-card rounded-2.5xl bg-bg-card border-border-main p-8 md:p-14 grid grid-cols-1 md:grid-cols-12 gap-10 items-center relative shadow-lg">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/5 to-transparent rounded-[3rem] blur-xl opacity-30 pointer-events-none" />
              {/* Left Column Profile Pic Mock */}
              <div className="md:col-span-4 flex justify-center relative z-10">
                <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-heading font-extrabold text-text-inverse text-5xl shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  AA
                </div>
              </div>

              {/* Right Column Bio */}
              <div className="md:col-span-8 space-y-6 text-center md:text-left relative z-10">
                <div>
                  <h3 className="text-2xl font-heading font-bold tracking-tight text-text-main">
                    Akinwunmi Awoyode
                  </h3>
                  <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1">
                    Managing Director & CEO, Property Max Results Ltd.
                  </p>
                </div>
                <p className="text-text-muted text-sm leading-relaxed text-wrap-pretty">
                  Recognised by *The Guardian Nigeria* as one of the visionary CEOs shaping the economic landscape. Holding an MSc in Real Estate Management & Investment from Edinburgh Napier University, UK, and an MBA from the University of South Wales, UK, he directs the academic standards of Housmata training handbook.
                </p>
                <div className="pt-2">
                  <Link
                    href="/instructors"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    View Full Credentials
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Call to Action Banner */}
        <section className="py-32 bg-bg-card relative overflow-hidden text-center scroll-section transition-all duration-1000 opacity-0 translate-y-12 [&.section-visible]:opacity-100 [&.section-visible]:translate-y-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,184,117,0.08),transparent_55%)]" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
            <h2 className="text-4xl sm:text-5xl font-heading font-black tracking-tight text-text-main text-wrap-balance">
              Start Your Property Operator Career
            </h2>
            <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed text-wrap-pretty">
              Submit your application details today. Our admissions board reviews submissions weekly and accepts students into active learning cohorts.
            </p>
            <div className="pt-4">
              <Link
                href="/apply"
                className="btn bg-primary text-text-inverse hover:brightness-110 px-10 py-4 rounded-xl font-bold inline-flex items-center gap-2 shadow-lg shadow-primary-glow transition-all"
              >
                Access Application Form
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

