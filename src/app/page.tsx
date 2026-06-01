"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Landmark, Users, BarChart3, Award } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import Logo from "@/components/Logo";

export default function Home() {
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
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 border-b border-border-main">
        {/* Decorative Grid Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(38,196,150,0.12),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(8,145,178,0.08),transparent_40%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            {/* Left Hero Details */}
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-glow border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider animate-fade-in">
                <Award className="w-3.5 h-3.5" />
                Housmata Verified Operator Program
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight leading-[1.1] text-text-main animate-fade-in">
                We train <span className="text-primary">Independent Systembacked</span> Estate Managers
              </h1>
              <p className="text-text-muted text-base sm:text-lg max-w-xl animate-fade-in leading-relaxed">
                This is not a generic real estate theory course. It is an operational training system designed to produce competent digital estate professionals who run structured workflows.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2 animate-fade-in">
                <Link
                  href="/apply"
                  className="btn bg-primary text-text-inverse hover:brightness-110 px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-glow transition-all"
                >
                  Apply to Academy
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/programs"
                  className="btn border border-border-main hover:bg-bg-card-hover text-text-main px-8 py-3.5 rounded-xl font-bold flex items-center justify-center transition-all"
                >
                  Explore Programs
                </Link>
              </div>
            </div>

            {/* Right Hero Badge Graphic */}
            <div className="md:col-span-5 flex justify-center w-full">
              <div className="relative w-full max-w-[280px] sm:max-w-xs md:max-w-md aspect-square rounded-3xl premium-card glass p-6 sm:p-8 flex flex-col justify-between items-center text-center border-border-main animate-fade-in">
                <div className="absolute -top-6 -right-6 px-4 py-2.5 rounded-2xl bg-amber-500 text-white font-extrabold text-xs tracking-wider uppercase rotate-6 shadow-md border border-amber-400">
                  Bootcamp Open
                </div>
                
                <div className="my-auto space-y-4">
                  <Logo height={48} showText={false} className="mx-auto" />
                  <div className="font-heading font-extrabold text-xl text-text-main">
                    HOUSMATA ACADEMY
                  </div>
                  <div className="h-px bg-border-main w-32 mx-auto" />
                  <p className="text-text-muted text-xs px-2 leading-relaxed">
                    Official credential issuer for digital estate operators inside the Housmata Property Management network.
                  </p>
                </div>

                <div className="w-full bg-primary-glow border border-primary/20 rounded-xl py-3 px-4 flex justify-between items-center text-xs font-semibold text-primary">
                  <span>Standard duration:</span>
                  <span>8-12 Weeks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Academy Overview */}
      <section className="py-24 border-b border-border-main bg-bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl font-heading font-extrabold text-text-main">
              The Mission of Housmata Academy
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-text-muted leading-relaxed">
              We exist to solve the biggest problem in property management: a lack of transparency, structure, and accountability. Our trainees graduate not as salespeople chasing a commission, but as custodians of trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-heading font-bold text-text-main">
                Replacing Informal Habits with Structured Systems
              </h3>
              <p className="text-text-muted leading-relaxed text-sm sm:text-base">
                In the real estate sector, disputes rarely arise from a lack of opportunities. They stem from poor documentation, hidden property defects, unauthorized co-mingling of landlord funds, and verbal agreements with no audit trail.
              </p>
              <div className="space-y-3.5">
                {[
                  "Enforces property data standardisation.",
                  "Systematizes tenant screening and KYC verifications.",
                  "Digitalizes inspections, maintenance logs, and financial flows.",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-text-main text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="premium-card rounded-2xl p-8 bg-bg-main border-border-main space-y-6">
              <div className="font-heading font-extrabold text-lg text-text-main flex items-center gap-2">
                <Landmark className="w-5 h-5 text-primary" />
                Under the Auspices of Property Max
              </div>
              <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
                Housmata Academy is designed and directed by <strong>Property Max Results Ltd</strong>, a leading real estate training and management institution shaping Nigeria&apos;s economic landscape. Our certifications are backed by industry credibility.
              </p>
              <div className="p-4 rounded-xl bg-bg-card border border-border-main flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-glow flex items-center justify-center font-heading font-extrabold text-primary">
                  L1
                </div>
                <div className="text-xs">
                  <p className="font-bold text-text-main">Ready-for-Deployment Network</p>
                  <p className="text-text-muted mt-0.5">Graduates enter our tracking database for immediate career status management.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Program Benefits */}
      <section className="py-24 border-b border-border-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl font-heading font-extrabold text-text-main">
              Why Join Housmata Academy?
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-text-muted leading-relaxed">
              We teach you how modern, digital real estate systems actually function in practice. Learn standard methodologies, get tested in a sandbox environment, and earn a public-verifiable certificate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="premium-card rounded-2xl p-6 bg-bg-card border-border-main flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-glow flex items-center justify-center">
                  {b.icon}
                </div>
                <h3 className="font-heading font-bold text-base text-text-main">
                  {b.title}
                </h3>
                <p className="text-text-muted text-xs leading-relaxed flex-grow">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Certification Pathway */}
      <section className="py-24 border-b border-border-main bg-bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl font-heading font-extrabold text-text-main">
              The Certification Ladder
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-text-muted leading-relaxed">
              Four levels of verification structured to advance you from trainee operator to an independent real estate agency owner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.map((lvl) => (
              <div key={lvl.num} className="premium-card rounded-2xl p-6 bg-bg-main border-border-main relative flex flex-col gap-4">
                <div className="absolute top-4 right-4 font-heading font-black text-4xl text-primary/10 select-none">
                  0{lvl.num}
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary text-text-inverse font-heading font-bold text-xs flex items-center justify-center">
                  LVL {lvl.num}
                </div>
                <h3 className="font-heading font-bold text-sm text-text-main mt-2">
                  {lvl.name}
                </h3>
                <p className="text-text-muted text-xs leading-relaxed flex-grow">
                  {lvl.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Instructor Highlights */}
      <section className="py-24 border-b border-border-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl font-heading font-extrabold text-text-main">
              Course Director
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          </div>

          <div className="max-w-4xl mx-auto premium-card rounded-2xl bg-bg-card border-border-main p-8 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Column Profile Pic Mock */}
            <div className="md:col-span-4 flex justify-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-heading font-extrabold text-text-inverse text-5xl shadow-md">
                AA
              </div>
            </div>

            {/* Right Column Bio */}
            <div className="md:col-span-8 space-y-4 text-center md:text-left">
              <div>
                <h3 className="text-2xl font-heading font-bold text-text-main">
                  Akinwunmi Awoyode
                </h3>
                <p className="text-primary text-xs font-bold uppercase tracking-wider mt-1">
                  Managing Director & CEO, Property Max Results Ltd.
                </p>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">
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
      <section className="py-24 bg-bg-card relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(38,196,150,0.08),transparent_50%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-text-main">
            Start Your Property Operator Career
          </h2>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
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
    </PublicLayout>
  );
}
