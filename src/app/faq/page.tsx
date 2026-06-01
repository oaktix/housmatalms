"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function FAQ() {
  const faqs = [
    {
      q: "What is Housmata Academy?",
      a: "Housmata Academy is a specialized training platform designed to produce certified digital estate managers and operators who run property management workflows under the Property Max Results Ltd ecosystem.",
    },
    {
      q: "Is this a generic real estate agent course?",
      a: "No. Unlike courses focused solely on sales commissions, we train you to operate property assets over their lifecycle: listing standardisation, KYC vetting, rent ledgers reconciliation, maintenance logs, and document auto-generation.",
    },
    {
      q: "What is the difference between Phase 1 and Phase 2?",
      a: "Phase 1 covers the theoretical foundations (9 modules including ethics, inspection checklist design, and property accounting). Phase 2 is a 7-Day Intensive Bootcamp where you execute actual operations inside a digital sandbox environment to prove your hands-on competence.",
    },
    {
      q: "How does the Admission Workflow work?",
      a: "Once you submit an application, the admin reviews it. If approved, the system creates your student credentials and assigns you to an active cohort. You will receive an automated email simulation with your access credentials.",
    },
    {
      q: "What are the Certification Levels?",
      a: "Level 1: Digital Property Management Operator (earned upon graduation). Level 2: Certified Estate Manager (requires 6 months of tracked operations). Level 3: Verified Independent Property Consultant (requires managing 15+ active units). Level 4: Housmata Partner Agency (tier to set up local franchise offices).",
    },
    {
      q: "Does the Academy provide job placements?",
      a: "We do not build job boards or placement networks. Instead, we maintain a simple, transparent Graduate Deployment status ('Active', 'Available', 'Assigned', 'Suspended', 'Alumni') so our real estate partner network can verify credentials and engage certified professionals immediately.",
    },
    {
      q: "How are certificates verified?",
      a: "Every certificate contains a unique ID and a QR code pointing to our public verification portal. Anyone can verify the authenticity of a graduate's certificate by searching the certificate ID.",
    },
  ];

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    if (expandedIndex === idx) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(idx);
    }
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
            Get clear, direct answers about Housmata Academy&apos;s curriculum, certification, and admissions.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="text-center pt-20 space-y-4">
          <h3 className="text-lg font-heading font-bold text-text-main">Have other questions?</h3>
          <p className="text-text-muted text-xs max-w-sm mx-auto leading-relaxed">
            Get in touch with our admissions office for details on the next bootcamp start date.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="btn bg-primary text-text-inverse hover:brightness-110 px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2 transition-all"
            >
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
