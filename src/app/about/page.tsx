"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, Eye, Heart, Landmark, Sparkles, BookOpen, AlertTriangle, FileText } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function About() {
  return (
    <PublicLayout>
      {/* Hero Header */}
      <section className="relative py-16 md:py-20 border-b border-border-main bg-bg-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(38,196,150,0.08),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-text-main">
            About Housmata Academy
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
            Forming standard, digital real estate operators to protect property data and transaction flow.
          </p>
        </div>
      </section>

      {/* Philosophy, Mission & Vision */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mission */}
          <div className="premium-card rounded-2xl p-8 bg-bg-card border-border-main space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-glow flex items-center justify-center">
              <Compass className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text-main">Our Mission</h3>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
              To institutionalize transparency and accountability in real estate operations. We equip trainees with standardized workflows, digital checklists, and integrity frameworks to eliminate false records.
            </p>
          </div>

          {/* Vision */}
          <div className="premium-card rounded-2xl p-8 bg-bg-card border-border-main space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-glow flex items-center justify-center">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text-main">Our Vision</h3>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
              To become the national licensing and standard-setting standard for property operators across West Africa, forming a secure network of certified, deployable real estate professionals.
            </p>
          </div>

          {/* Philosophy */}
          <div className="premium-card rounded-2xl p-8 bg-bg-card border-border-main space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-glow flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text-main">Our Philosophy</h3>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
              <strong>&apos;We are not training agents to join a market. We are training operators to build a new one.&apos;</strong> Trust is the ultimate asset. Everything else, from data entry and inspections to collection, serves to safeguard this currency.
            </p>
          </div>
        </div>

        {/* Ecosystem Explanation */}
        <div className="mt-20 premium-card rounded-2xl p-8 md:p-12 bg-bg-card border-border-main grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-main">
              The Housmata Real Estate Ecosystem
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">
              Housmata functions as a unified digital ecosystem where property data, financial reconciliation, inspection checklists, and tenancy agreements are dynamically linked. 
            </p>
            <p className="text-text-muted text-sm leading-relaxed">
              Rather than relying on fragmented WhatsApp communications or spreadsheet logs, operators perform their duties within our centralized platform. This ensures landlords receive traceable records, and tenants enter clean, audited buildings.
            </p>
            <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-primary-glow border border-primary/20 text-xs font-semibold text-primary">
              <Landmark className="w-4 h-4 flex-shrink-0" />
              Course backed by Property Max Results Ltd. Handbooks.
            </div>
          </div>
          
          <div className="md:col-span-5 bg-bg-main border border-border-main p-6 rounded-2xl space-y-4">
            <h3 className="font-heading font-bold text-base text-text-main">Operational Standard</h3>
            <div className="space-y-3 text-xs text-text-muted">
              <div className="p-3 bg-bg-card rounded-lg border border-border-main">
                <span className="font-bold text-text-main block">1. Clean Listings</span>
                100% verified location, specs, pricing, and availability. No duplicates.
              </div>
              <div className="p-3 bg-bg-card rounded-lg border border-border-main">
                <span className="font-bold text-text-main block">2. Standardized KYC</span>
                Every tenant is scored based on documented verify files.
              </div>
              <div className="p-3 bg-bg-card rounded-lg border border-border-main">
                <span className="font-bold text-text-main block">3. Structured Maintenance</span>
                Ticketing distributes workflows to verified service vendors instantly.
              </div>
            </div>
          </div>
        </div>

        {/* AI-Powered Ecosystem */}
        <div className="mt-20 premium-card rounded-2xl p-8 md:p-12 bg-bg-main border border-primary/20 grid grid-cols-1 md:grid-cols-12 gap-8 items-center scroll-scale-in">
          <div className="md:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-text-inverse text-[0.7rem] font-extrabold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Intelligence Built In
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-main">
              A Smarter Real Estate Training Ecosystem
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">
              Housmata is more than a course library. Our platform embeds artificial intelligence across the entire learning journey so trainees absorb material faster, instructors grade more consistently, and admissions spot risk earlier. The result is a verifiable, system-backed operator, not just a certificate holder.
            </p>
          </div>

          <div className="md:col-span-6 space-y-3">
            {[
              { icon: BookOpen, title: "AI Lesson Assistant", desc: "Summarizes handbook lessons and answers study questions in plain English." },
              { icon: AlertTriangle, title: "At-Risk Detection", desc: "Flags slipping students automatically and suggests timely interventions." },
              { icon: FileText, title: "AI Grading Support", desc: "Helps instructors draft structured, fair feedback while keeping the final verdict human." },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-bg-card border border-border-main">
                <div className="w-10 h-10 rounded-lg bg-primary-glow text-primary flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-text-main text-sm">{f.title}</p>
                  <p className="text-text-muted text-xs leading-relaxed mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center space-y-4">
          <h3 className="text-xl font-heading font-bold text-text-main">Ready to Join Our Ranks?</h3>
          <p className="text-text-muted text-xs max-w-md mx-auto leading-relaxed">
            Apply to join our upcoming cohort and transition from a basic agent to a certified digital property operator.
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
