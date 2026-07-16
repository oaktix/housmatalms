"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function FAQ() {
  const faqs = [
    {
      q: "What is Housmata Academy?",
      a: "Housmata Academy is a specialized training platform designed to produce certified digital real estate operators under the Property Max Results Ltd ecosystem. We now offer two distinct certification tracks: Housmata Certified Estate Manager (HCEM) and Housmata Certified Property Advisor (HCPA).",
    },
    {
      q: "What is the difference between the HCEM and HCPA tracks?",
      a: "The Housmata Certified Estate Manager (HCEM) track focuses on Rent Management & Property Operations (tenancy agreements, rent tracking ledgers, maintenance tickets, and landlord reports). The Housmata Certified Property Advisor (HCPA) track focuses on Property Advisory, Verification & Investment (due diligence, coordinate charting to check for forest reserves/committed acquisitions, Lands Registry search reports, property finance, and client brokerage).",
    },
    {
      q: "Who is each certification track designed for?",
      a: "HCEM is for property managers, letting agents, facility operators, and estate administrators. HCPA is for property consultants, sales agents, investment brokers, and independent consultants advising clients on safe acquisitions.",
    },
    {
      q: "Can I take both the HCEM and HCPA courses at the same time?",
      a: "No. Trainees are allowed to enroll in only one track at a time. Each track requires a separate application, individual review, and approval from the admissions panel. You may apply for the second track after completing your current program.",
    },
    {
      q: "What is the training progression for each track?",
      a: "Both courses share a similar three-phase template: Phase 1 (Self-Paced Modules & Quizzes) → Phase 2 (Live Intensive Bootcamp Sessions) → Phase 3 (Supervised Field Practicals & Final Portfolio Submission).",
    },
    {
      q: "What are the grading requirements for passing modules?",
      a: "Every module in Phase 1 requires you to read all lessons, pass a 10-question multiple-choice assessment with a score of 75% or higher, and submit a practical assignment. Your final module grade is weighted: 30% from the Quiz and 70% from the Instructor's assignment score.",
    },
    {
      q: "How does the Admission process work?",
      a: "You submit an application indicating your selected track. Our admissions team reviews it. Upon approval, you will receive login details for the Student LMS dashboard, and you must complete a Pre-Course Knowledge Survey before beginning.",
    },
    {
      q: "How do certificate verifications work?",
      a: "All graduates receive a verified credential with a unique ID and a QR code linked to our central verification portal, letting developers, banks, and clients confirm active certification status.",
    },
  ];

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <PublicLayout>
      <section className="relative py-16 md:py-20 border-b border-border-main bg-bg-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(38,196,150,0.08),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-text-main">
            Frequently Asked Questions
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
            Get clear, direct answers about Housmata Academy&apos;s certification tracks, admissions, and grading.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-bg-main">
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = expandedIndex === index;
            return (
              <div
                key={index}
                className="premium-card rounded-2xl bg-bg-card border-border-main overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-bg-card-hover transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <h3 className="font-heading font-bold text-sm sm:text-base text-text-main">
                      {faq.q}
                    </h3>
                  </div>
                  <div className="p-1 rounded bg-bg-main border border-border-main text-text-muted">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 border-t border-border-main pt-4 bg-bg-main/20 animate-fade-in">
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed pl-9">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center pt-16 space-y-4">
          <h3 className="text-lg font-heading font-bold text-text-main">Ready to Start?</h3>
          <p className="text-text-muted text-xs max-w-sm mx-auto leading-relaxed">
            Apply to begin either the Estate Manager or Property Advisor track. Admissions undergo panel review.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/programs"
              className="btn border border-border-main text-text-muted hover:text-text-main px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all"
            >
              View Programs
            </Link>
            <Link
              href="/apply"
              className="btn bg-primary text-text-inverse hover:brightness-110 px-6 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-all"
            >
              Start Application
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
