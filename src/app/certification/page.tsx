"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Search, Sparkles, FileText } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function Certification() {
  const steps = [
    {
      step: 1,
      title: "Module Assessments",
      desc: "Complete 9 core theoretical modules in Phase 1, submitting assignments and passing quizzes with a minimum score of 75%.",
    },
    {
      step: 2,
      title: "Intensive 7-Day Bootcamp",
      desc: "Execute practical operations in the sandbox environment: building listings, screening tenants, mapping landlord assets, and reconciling payments.",
    },
    {
      step: 3,
      title: "Final Capstone Simulation",
      desc: "Perform an end-to-end simulated property transaction case study under pressure. Your work is reviewed by a Senior Instructor.",
    },
    {
      step: 4,
      title: "Credential Issuance",
      desc: "Receive a unique certificate ID and QR code, registering your professional availability status in the Graduate Deployment network.",
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Header */}
      <section className="relative py-16 md:py-20 border-b border-border-main bg-bg-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(38,196,150,0.08),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-text-main">
            Certification Process
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
            Housmata credentials represent proven system competency, not attendance. Learn how to get certified.
          </p>
        </div>
      </section>

      {/* Certification Flow */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Step-by-Step Flow */}
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-main text-center mb-12">
            The Graduation Pathway
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="space-y-3 relative text-center md:text-left">
                <div className="w-10 h-10 rounded-full bg-primary text-text-inverse font-heading font-extrabold text-sm flex items-center justify-center mx-auto md:mx-0">
                  {s.step}
                </div>
                <h3 className="font-heading font-bold text-base text-text-main">
                  {s.title}
                </h3>
                <p className="text-text-muted text-xs leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Standards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-10">
          <div className="space-y-5">
            <h2 className="text-2xl font-heading font-bold text-text-main">
              Competency Standards & Graduation Rules
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">
              We enforce strict compliance criteria to safeguard property portfolios inside the Property Max network. A candidate is only awarded the Level 1 certification if they:
            </p>
            <div className="space-y-3.5">
              {[
                "Achieve a score of 75% or higher on all theory assessments.",
                "Complete all 4 practical course assignments to standard.",
                "Successfully pass the final Day 7 Capstone Simulation.",
                "Demonstrate strict alignment with code of ethics (no co-mingling, verified listing descriptions).",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-text-main text-sm font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-bg-card border border-border-main space-y-6">
            <div className="w-12 h-12 rounded-xl bg-primary-glow flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-base text-text-main">
              Verifiable Credentials
            </h3>
            <p className="text-text-muted text-xs leading-relaxed">
              Every certificate issued is assigned a unique identifier (e.g., `HS-LVL1-XXXXXX`) and a cryptographic hash stored in our verification database.
            </p>
            <p className="text-text-muted text-xs leading-relaxed">
              Landlords, partners, and recruiters can verify any candidate&apos;s certification status and active deployment classification in real-time on our public verification portal.
            </p>
            <div className="pt-2">
              <Link
                href="/verify/HS-LVL1-DEMO"
                className="btn border border-border-main hover:bg-bg-card-hover text-text-main px-5 py-2.5 rounded-xl text-xs font-bold flex items-center w-fit gap-2 transition-all"
              >
                <Search className="w-4 h-4" />
                Go to Verification Page
              </Link>
            </div>
          </div>
        </div>

        {/* AI-Assisted Grading Note */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-glow/40 to-bg-card p-8 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-text-inverse text-[0.7rem] font-extrabold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Assisted, Human-Verified
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-text-main mt-4">
              Faster, Fairer Assessment
            </h3>
            <p className="text-text-muted text-sm leading-relaxed mt-3">
              Our AI helps instructors draft consistent, structured feedback on assignments in seconds, and gives you instant explanations after every quiz. The final grade and certification decision always stays with a qualified human instructor.
            </p>
          </div>
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-bg-card border border-border-main">
              <div className="w-9 h-9 rounded-lg bg-primary-glow text-primary flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-text-main text-xs">AI Grading Support</p>
                <p className="text-text-muted text-[11px] leading-relaxed mt-0.5">Structured feedback drafted fast, verified by instructors.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-bg-card border border-border-main">
              <div className="w-9 h-9 rounded-lg bg-primary-glow text-primary flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-text-main text-xs">AI Answer Explanations</p>
                <p className="text-text-muted text-[11px] leading-relaxed mt-0.5">Clear breakdowns of every quiz result.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center pt-10 space-y-4">
          <h3 className="text-lg font-heading font-bold text-text-main">Apply to Begin</h3>
          <p className="text-text-muted text-xs max-w-sm mx-auto leading-relaxed">
            Ready to prove your competence? Submit your application for the next cohort onboarding schedule.
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
