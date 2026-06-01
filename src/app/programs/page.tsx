"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Calendar, CheckCircle2, ChevronRight } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function Programs() {
  const levels = [
    {
      num: 1,
      name: "Level 1: Digital Property Management Operator",
      desc: "Our baseline entry level. Standardizes foundational knowledge, platform onboarding, client records administration, and digital property listings verification.",
      requirements: ["Complete Phase 1 (9 Modules) & Phase 2 (7 Days Bootcamp)", "Pass the Capstone system simulation with 75%+", "Agree to the Housmata Code of Professional Ethics"],
    },
    {
      num: 2,
      name: "Level 2: Certified Estate Manager",
      desc: "Intermediate level demonstrating facility management competence, vendor lifecycle mapping, rent default collection structures, and tenancy agreement management.",
      requirements: ["Earn Level 1 Credential", "6 months tracked operational history inside the ecosystem", "Complete the maintenance management assessment"],
    },
    {
      num: 3,
      name: "Level 3: Verified Independent Property Consultant",
      desc: "Advanced level for operators structuring portfolios for high-net-worth individuals, managing multi-unit assets, and leading communication negotiations.",
      requirements: ["Earn Level 2 Credential", "Manage at least 15 active units with 95%+ rent collections", "Conduct and document 10 structural property inspections"],
    },
    {
      num: 4,
      name: "Level 4: Housmata Partner Agency",
      desc: "Enterprise franchise tier. Allows operators to run local management offices using the full suite of Housmata backend software, CRM, and branding assets.",
      requirements: ["Earn Level 3 Credential", "Register a business entity through Property Max templates", "Maintain a clean audit and verified deployment status record"],
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Header */}
      <section className="relative py-16 md:py-20 border-b border-border-main bg-bg-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(38,196,150,0.08),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-text-main">
            Training & Programs
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
            From foundation theory to intensive digital application sandboxes. Find your path in real estate management.
          </p>
        </div>
      </section>

      {/* Program Tracks */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Track 1: Foundation Training */}
        <div className="premium-card rounded-2xl p-8 md:p-12 bg-bg-card border-border-main grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-glow border border-primary/20 text-xs font-bold text-primary uppercase">
              Phase 1
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-main">
              Foundation Training: Real Estate OS
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">
              Grounds trainees in fundamental real estate principles. Learn common unethical traps to avoid, master landlord/tenant psychology, design inspection forms, and review tenancy documentation.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-text-muted">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Duration: 8-12 Weeks
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Curriculum: 9 Modules
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/curriculum"
                className="btn bg-primary text-text-inverse hover:brightness-110 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center w-fit gap-1.5 transition-all"
              >
                View Modules
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-5 bg-bg-main border border-border-main p-6 rounded-xl space-y-4">
            <h4 className="font-heading font-bold text-sm text-text-main">What you will learn:</h4>
            <ul className="space-y-3 text-xs text-text-muted">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                Ethics as an operating system (Rule-based funds).
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                Structural property inspection checks.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                Tenancy agreements and inventory sheet rules.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                Negotiation objections handling.
              </li>
            </ul>
          </div>
        </div>

        {/* Track 2: 7-Day Bootcamp */}
        <div className="premium-card rounded-2xl p-8 md:p-12 bg-bg-card border-border-main grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5 lg:order-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-glow border border-primary/20 text-xs font-bold text-primary uppercase">
              Phase 2
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-main">
              7-Day Intensive Execution Bootcamp
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">
              Transition from helper assistant to digital property manager. An execution-focused intensive course mapping listings standardisation, tenant scoring KYC, rent ledger tracking, and capstone simulations.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-text-muted">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Frequency: 3 Live Classes / Week
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Duration: 7 Days Intensive
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/curriculum"
                className="btn bg-primary text-text-inverse hover:brightness-110 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center w-fit gap-1.5 transition-all"
              >
                View Sandbox Modules
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-bg-main border border-border-main p-6 rounded-xl space-y-4 lg:order-1">
            <h4 className="font-heading font-bold text-sm text-text-main">Bootcamp Daily Sandbox:</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-text-muted">
              <div className="p-2 bg-bg-card border border-border-main rounded">Day 1: Listings Control</div>
              <div className="p-2 bg-bg-card border border-border-main rounded">Day 2: Tenant KYC</div>
              <div className="p-2 bg-bg-card border border-border-main rounded">Day 3: Landlords CRM</div>
              <div className="p-2 bg-bg-card border border-border-main rounded">Day 4: Rent Ledgers</div>
              <div className="p-2 bg-bg-card border border-border-main rounded">Day 5: Maintenance Board</div>
              <div className="p-2 bg-bg-card border border-border-main rounded">Day 6: Document Auto-Gen</div>
            </div>
          </div>
        </div>

        {/* Level Breakdown Grid */}
        <div className="pt-10">
          <h2 className="text-2xl font-heading font-bold text-text-main text-center mb-10">
            Certification Level Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {levels.map((lvl) => (
              <div key={lvl.num} className="premium-card rounded-2xl p-8 bg-bg-card border-border-main space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="font-heading font-bold text-base text-primary">
                    {lvl.name}
                  </h3>
                  <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
                    {lvl.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-border-main mt-4">
                  <span className="text-[11px] font-extrabold uppercase text-text-main tracking-wider block mb-2">
                    Requirements to Earn:
                  </span>
                  <ul className="space-y-1.5 text-xs text-text-muted">
                    {lvl.requirements.map((req, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-10 space-y-4">
          <h3 className="text-lg font-heading font-bold text-text-main">Join the Admissions Funnel</h3>
          <p className="text-text-muted text-xs max-w-sm mx-auto leading-relaxed">
            Apply to begin either the standard path or the accelerated Bootcamp. Applications enter the admin reviews list.
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
