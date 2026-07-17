"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Landmark, BookOpen, Check, Home as HomeIcon, TrendingUp, Sparkles, Award, UserCheck, AlertTriangle, FileText } from "lucide-react";
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

  const tracks = [
    {
      icon: <HomeIcon className="w-6 h-6 text-primary" />,
      title: "Housmata Certified Estate Manager (HCEM)",
      subtitle: "Rent Management & Operations",
      desc: "Designed for property managers, letting agents, and facility operators. Focuses on daily rent collection cycles, tenancy agreement writing, tenant-landlord mediation, maintenance tickets, and utility logs.",
      link: "/curriculum",
      badgeColor: "bg-primary-glow border-primary/20 text-primary",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-amber-400" />,
      title: "Housmata Certified Property Advisor (HCPA)",
      subtitle: "Property Advisory & Verification",
      desc: "Designed for independent property consultants, sales agents, and investment advisors. Focuses on title verification searches, coordinate charting for forest reserves, land banking analysis, and property finance eligibility.",
      link: "/curriculum/hcpa",
      badgeColor: "bg-amber-500/10 border-amber-500/20 text-amber-400",
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
      name: "Certified Estate Manager / Advisor",
      desc: "Proficient in managing cohort portfolios, service vendors, maintenance tickets, or client investment advisory cases.",
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

        {/* Floating Real Estate Vector Animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 select-none">
          <style>{`
            @keyframes float-slow {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-30px) rotate(8deg); }
            }
            @keyframes float-mid {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-40px) rotate(-12deg); }
            }
            .animate-float-1 { animation: float-slow 7s ease-in-out infinite; }
            .animate-float-2 { animation: float-mid 9s ease-in-out infinite; }
            .animate-float-3 { animation: float-slow 12s ease-in-out infinite; }
            .animate-float-4 { animation: float-mid 8s ease-in-out infinite; }
          `}</style>
          
          {/* Section 1 Hero Prominent Floating SVGs - Parallax depth layers */}
          <svg className="absolute top-[10%] left-[6%] w-24 h-24 text-emerald-600/[0.15] dark:text-white/[0.09] stroke-current stroke-[2] animate-float-1 parallax-layer-1 transition-all duration-300 hover:text-primary/30" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <svg className="absolute top-[22%] right-[8%] w-20 h-20 text-emerald-600/[0.15] dark:text-white/[0.09] stroke-current stroke-[2] animate-float-2 parallax-layer-2 transition-all duration-300 hover:text-secondary/30" viewBox="0 0 24 24" fill="none"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3M15.5 7.5L14 9"/></svg>
          <svg className="absolute bottom-[35%] left-[5%] w-18 h-18 text-emerald-600/[0.15] dark:text-white/[0.09] stroke-current stroke-[2] animate-float-3 parallax-layer-3 transition-all duration-300 hover:text-primary/30" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <svg className="absolute bottom-[46%] right-[6%] w-24 h-24 text-emerald-600/[0.15] dark:text-white/[0.09] stroke-current stroke-[2] animate-float-4 parallax-layer-1 transition-all duration-300 hover:text-amber-400/30" viewBox="0 0 24 24" fill="none"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>

          {/* Section 2 Tracks Prominent Floating SVGs */}
          <svg className="absolute top-[52%] left-[8%] w-22 h-22 text-emerald-600/[0.14] dark:text-white/[0.08] stroke-current stroke-[2] animate-float-2 parallax-layer-2 transition-all duration-300 hover:text-primary/30" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
          <svg className="absolute top-[68%] right-[10%] w-20 h-20 text-emerald-600/[0.14] dark:text-white/[0.08] stroke-current stroke-[2] animate-float-1 parallax-layer-3 transition-all duration-300 hover:text-secondary/30" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>

          {/* Section 3 Path Prominent Floating SVGs */}
          <svg className="absolute bottom-[18%] left-[7%] w-24 h-24 text-emerald-600/[0.15] dark:text-white/[0.09] stroke-current stroke-[2] animate-float-4 parallax-layer-1 transition-all duration-300 hover:text-primary/30" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
          <svg className="absolute bottom-[5%] right-[9%] w-22 h-22 text-emerald-600/[0.15] dark:text-white/[0.09] stroke-current stroke-[2] animate-float-3 parallax-layer-2 transition-all duration-300 hover:text-amber-400/30" viewBox="0 0 24 24" fill="none"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>

        {/* 1. Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-36 md:pt-44 md:pb-48 border-b border-border-main scroll-section transition-all duration-1000 scroll-fade-in">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(2,184,117,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,184,117,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(2,184,117,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,184,117,0.05)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] animate-grid-move pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-main/40 to-bg-main pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              {/* Left Hero Details */}
              <div className="lg:col-span-7 space-y-8 text-left transition-all duration-700 transform translate-y-4 opacity-0 [animation-fill-mode:forwards] animate-slide-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-glow border border-primary/20 text-primary text-[0.7rem] font-extrabold uppercase tracking-widest shadow-[0_4px_20px_rgba(2,184,117,0.08)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-Powered Real Estate Academy
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-black tracking-tight leading-[0.98] text-text-main text-wrap-balance">
                  We train <br className="hidden md:inline" />
                  <span className="text-primary font-black relative inline-block">
                    system-backed
                    <span className="absolute left-0 bottom-2 h-4 w-full bg-primary-glow/60 -z-10 rounded-full" />
                  </span> <br />
                  real estate experts
                </h1>
                <p className="text-text-muted text-base sm:text-lg max-w-xl leading-relaxed">
                  Choose between two high-performance professional tracks: Rent Management (HCEM) or Property Advisory &amp; Title Verification (HCPA). Train inside an AI-assisted learning environment that summarizes lessons, explains answers, screens applications, and flags at-risk students automatically.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link
                    href="/apply"
                    className="btn bg-primary text-text-inverse hover:brightness-110 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-glow hover:shadow-[0_0_30px_rgba(2,184,117,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Start Admission Form
                    <ArrowRight className="w-4.5 h-4.5" />
                  </Link>
                  <Link
                    href="/programs"
                    className="btn border border-border-main bg-bg-card/40 backdrop-blur-sm hover:bg-bg-card-hover text-text-main px-8 py-4 rounded-xl font-bold flex items-center justify-center transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Compare Tracks &amp; Curriculums
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
                        <div className="text-[0.6rem] text-text-muted uppercase tracking-wider font-black">Active Curriculum</div>
                        <div className="text-sm font-bold text-text-main">Dynamic Multi-Track LMS</div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-primary-glow flex items-center justify-center text-primary font-black text-xs">
                        2x
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-bg-main/50 border border-border-main/60 space-y-2">
                      <div className="flex justify-between items-center text-[0.6rem] text-text-muted uppercase tracking-wider font-black">
                        <span>Checklist Milestones</span>
                        <span className="text-primary">Track-Aware</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-text-main">
                          <Check className="w-3.5 h-3.5 text-primary" />
                          <span>Pre-Course Competency Survey</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-text-main">
                          <Check className="w-3.5 h-3.5 text-primary" />
                          <span>10-Question Module Quizzes (75%+)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                          <div className="w-3.5 h-3.5 rounded-full border border-border-main flex-shrink-0" />
                          <span>Final Certification Harvest</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1 p-3.5 rounded-xl bg-bg-main/30 border border-border-main/40 text-center">
                        <div className="text-[0.55rem] text-text-muted uppercase tracking-wider font-black">Certified Tracks</div>
                        <div className="text-lg font-black text-primary">HCEM &amp; HCPA</div>
                      </div>
                      <div className="flex-1 p-3.5 rounded-xl bg-bg-main/30 border border-border-main/40 text-center">
                        <div className="text-[0.55rem] text-text-muted uppercase tracking-wider font-black">Mode</div>
                        <div className="text-sm font-black text-secondary">Self-Paced</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Choose Your Track */}
        <section className="py-28 border-b border-border-main bg-bg-card relative scroll-section transition-all duration-1000 opacity-0 translate-y-12 [&.section-visible]:opacity-100 [&.section-visible]:translate-y-0 scroll-slide-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
              <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-text-main">
                Select Your Professional Pathway
              </h2>
              <div className="h-1.5 w-16 bg-primary mx-auto rounded-full" />
              <p className="text-text-muted leading-relaxed text-base">
                Trainees may only take one certification track at a time. Each track is designed for specific career goals and features specialized self-paced modules, bootcamp sandboxes, and field practicals.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 scroll-stagger">
              {tracks.map((track, idx) => (
                <div key={idx} className="premium-card rounded-2.5xl p-8 bg-bg-main border-border-main space-y-6 flex flex-col justify-between shadow-lg hover:border-primary/30 transition-all duration-300 scroll-glow">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-bg-card border border-border-main flex items-center justify-center">
                        {track.icon}
                      </div>
                      <div>
                        <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${track.badgeColor}`}>
                          {track.subtitle}
                        </span>
                        <h3 className="font-heading font-extrabold text-base sm:text-lg text-text-main mt-0.5">
                          {track.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
                      {track.desc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border-main/50 flex gap-3">
                    <Link
                      href={track.link}
                      className="btn border border-border-main text-text-muted hover:text-text-main px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      View Curriculum
                    </Link>
                    <Link
                      href="/apply"
                      className="btn bg-primary text-text-inverse hover:brightness-110 px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      Apply Now
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Replacement of Habits */}
        <section className="py-28 border-b border-border-main bg-bg-main scroll-section transition-all duration-1000 opacity-0 translate-y-12 [&.section-visible]:opacity-100 [&.section-visible]:translate-y-0 scroll-slide-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7 space-y-8 scroll-stagger">
                <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-text-main">
                  Replacing Informal Real Estate Habits with Structured Technology
                </h2>
                <p className="text-text-muted leading-relaxed text-base">
                  Disputes and losses in real estate rarely stem from a lack of market opportunities. They arise from unverified titles, forest-reserve coordination failures, co-mingling of client funds, and verbal tenancy agreements. Housmata Academy provides the technical framework to eliminate these risks.
                </p>
                <div className="space-y-4">
                  {[
                    "Enforces coordinate checks and Lands Registry verification standards.",
                    "Systematizes tenant profiling and KYC screening parameters.",
                    "Digitalizes rent ledgers, maintenance tickets, and compliance document flows.",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3.5">
                      <CheckCircle2 className="w-5.5 h-5.5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text-main text-sm font-semibold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 premium-card rounded-2xl p-8 bg-bg-card border-border-main space-y-8 relative shadow-lg shadow-black/5">
                <div className="font-heading font-extrabold text-lg text-text-main flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-primary" />
                  Under the Auspices of Property Max
                </div>
                <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
                  Designed and directed by <strong>Property Max Results Ltd</strong>, a leading real estate training and management institution shaping Nigeria&apos;s economic landscape. Our certifications are backed by verified industry authority.
                </p>
                <div className="p-4.5 rounded-xl bg-bg-main border border-border-main flex items-center gap-4.5">
                  <div className="w-12 h-12 rounded-xl bg-primary-glow flex items-center justify-center font-heading font-extrabold text-primary flex-shrink-0">
                    LMS
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-text-main">Dynamic Graduate Deployment status</p>
                    <p className="text-text-muted mt-0.5 leading-relaxed">Graduates enter our tracking database for immediate career status verification by our developer network.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3.5 AI-Powered Learning Section */}
        <section className="py-28 border-b border-border-main bg-bg-main relative scroll-section transition-all duration-1000 opacity-0 translate-y-12 [&.section-visible]:opacity-100 [&.section-visible]:translate-y-0 scroll-slide-up">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,184,117,0.06),transparent_55%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-glow border border-primary/20 text-primary text-[0.7rem] font-extrabold uppercase tracking-widest shadow-[0_4px_20px_rgba(2,184,117,0.08)] mx-auto w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                Built-In Artificial Intelligence
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-text-main">
                An Academy That Learns With You
              </h2>
              <p className="text-text-muted leading-relaxed text-base">
                Every trainee trains inside a smart, AI-assisted environment. From the first lesson to final certification, our models help students move faster, instructors grade fairer, and admissions spot risk earlier.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: BookOpen,
                  title: "AI Lesson Assistant",
                  desc: "Summarize any lesson into key takeaways or ask plain-English questions about the handbook material as you study.",
                  color: "bg-primary-glow text-primary border-primary/20",
                },
                {
                  icon: CheckCircle2,
                  title: "AI Answer Explanations",
                  desc: "After every quiz, get a clear, conversational breakdown of why the correct answer is right and where you went wrong.",
                  color: "bg-primary-glow text-primary border-primary/20",
                },
                {
                  icon: Award,
                  title: "Smart Scorecard Insights",
                  desc: "Receive a personalized, encouraging read on your grades: what you are doing well and exactly where to focus next.",
                  color: "bg-accent-glow text-accent border-accent/20",
                },
                {
                  icon: UserCheck,
                  title: "AI Application Screening",
                  desc: "Admissions gets an instant, structured recommendation on each applicant so strong candidates are never missed.",
                  color: "bg-secondary-glow text-secondary border-secondary/20",
                },
                {
                  icon: AlertTriangle,
                  title: "At-Risk Detection",
                  desc: "Instructors and admins receive automatic briefings on students who are slipping, with suggested interventions.",
                  color: "bg-error/10 text-error border-error/20",
                },
                {
                  icon: FileText,
                  title: "AI Grading Support",
                  desc: "Instructors draft structured, consistent feedback in seconds while keeping the final human verdict in their hands.",
                  color: "bg-secondary-glow text-secondary border-secondary/20",
                },
              ].map((f, idx) => (
                <div
                  key={idx}
                  className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4 hover:border-primary/30 transition-all duration-300 scroll-stagger"
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${f.color}`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-text-main">{f.title}</h3>
                  <p className="text-text-muted text-xs sm:text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/programs"
                className="btn bg-primary text-text-inverse hover:brightness-110 px-8 py-3.5 rounded-xl font-bold inline-flex items-center gap-2 transition-all"
              >
                Explore the AI-Enhanced Tracks
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4. Certification Pathway */}
        <section className="py-28 border-b border-border-main bg-bg-card scroll-section transition-all duration-1000 opacity-0 translate-y-12 [&.section-visible]:opacity-100 [&.section-visible]:translate-y-0 scroll-slide-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
              <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-text-main">
                The Certification Ladder
              </h2>
              <div className="h-1.5 w-16 bg-primary mx-auto rounded-full" />
              <p className="text-text-muted leading-relaxed text-base">
                Four levels of verification structured to advance you from trainee operator to an independent real estate agency owner.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 scroll-stagger">
              {levels.map((lvl) => (
                <div 
                  key={lvl.num} 
                  className="premium-card rounded-2xl p-7 bg-bg-main border-border-main relative flex flex-col gap-5 transition-all duration-500 shadow-md hover:-translate-y-1.5 scroll-glow"
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

        {/* 5. Course Director */}
        <section className="py-28 border-b border-border-main scroll-section transition-all duration-1000 bg-bg-main scroll-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
              <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-text-main">
                Course Director
              </h2>
              <div className="h-1.5 w-16 bg-primary mx-auto rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto premium-card rounded-2.5xl bg-bg-card border-border-main p-8 md:p-14 grid grid-cols-1 md:grid-cols-12 gap-10 items-center relative shadow-lg scroll-scale-in">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/5 to-transparent rounded-[3rem] blur-xl opacity-30 pointer-events-none" />
              <div className="md:col-span-4 flex justify-center relative z-10">
                <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-heading font-extrabold text-text-inverse text-5xl shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  AA
                </div>
              </div>

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
        <section className="py-32 bg-bg-card relative overflow-hidden text-center scroll-section transition-all duration-1000 scroll-scale-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,184,117,0.08),transparent_55%)]" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
            <h2 className="text-4xl sm:text-5xl font-heading font-black tracking-tight text-text-main text-wrap-balance">
              Start Your Real Estate Operator Career
            </h2>
            <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed text-wrap-pretty">
              Submit your application details today. Our admissions board reviews submissions weekly and accepts students into their chosen cohort tracks.
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <Link
                href="/programs"
                className="btn border border-border-main text-text-muted hover:text-text-main px-8 py-4 rounded-xl font-bold flex items-center justify-center transition-all"
              >
                Compare Program Tracks
              </Link>
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
