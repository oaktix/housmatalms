"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp, CheckCircle2, FileText, TrendingUp, Sparkles } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { hcpaCurriculum } from "@/lib/curriculum";

export default function HCPACurriculum() {
  const [expandedModule, setExpandedModule] = useState<string | null>("module-hcpa-0");

  const toggleModule = (id: string) => {
    setExpandedModule(expandedModule === id ? null : id);
  };

  return (
    <PublicLayout>
      {/* Hero Header */}
      <section className="relative py-16 md:py-20 border-b border-border-main bg-bg-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.06),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[11px] font-extrabold uppercase text-amber-400 tracking-widest">HCPA · Track 2</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-text-main text-center">
            Housmata Certified Property Advisor
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed text-center">
            A structured 16-module self-paced curriculum covering property advisory, title verification, investment strategy, digital marketing, and professional certification.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Link
              href="/programs"
              className="btn border border-border-main text-text-muted hover:text-text-main px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all"
            >
              Compare Tracks
            </Link>
            <Link
              href="/apply"
              className="btn bg-amber-500 text-white hover:brightness-110 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all"
            >
              Apply for HCPA
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Curriculum Content */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Phase Badge */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 uppercase">
            Phase 1 · Self-Paced Modules
          </div>
          <span className="text-xs text-text-muted">{hcpaCurriculum.length} modules total</span>
        </div>

        {/* AI-Assisted Study Banner */}
        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-text-main text-sm flex items-center gap-1.5">
              AI-Assisted While You Study
            </p>
            <p className="text-text-muted text-xs leading-relaxed mt-0.5">
              Inside the student portal, every lesson can be summarized on demand and any quiz answer explained in plain English by our built-in AI assistant.
            </p>
          </div>
        </div>

        {/* Module List */}
        <div className="space-y-4">
          {hcpaCurriculum.map((mod, index) => {
            const isExpanded = expandedModule === mod.id;
            return (
              <div
                key={mod.id}
                className={`premium-card rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isExpanded
                    ? "bg-bg-card border-amber-500/25"
                    : "bg-bg-card border-border-main hover:border-border-main-hover"
                }`}
              >
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center gap-4 p-5 sm:p-6 text-left"
                >
                  {/* Number Badge */}
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                    isExpanded
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                      : "bg-bg-main border-border-main text-text-muted"
                  }`}>
                    {index + 1}
                  </div>

                  {/* Title & Objective */}
                  <div className="flex-grow min-w-0 space-y-0.5">
                    <h3 className="font-heading font-bold text-sm text-text-main leading-snug">{mod.title}</h3>
                    <p className="text-xs text-text-muted truncate">{mod.objective}</p>
                  </div>

                  {/* Expand Icon */}
                  <div className="flex-shrink-0 text-text-muted">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 space-y-5 border-t border-border-main/50 pt-4">
                    {/* Lessons */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-widest block">
                        Lessons
                      </span>
                      {mod.lessons.map((lesson, li) => (
                        <div key={li} className="flex gap-3">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-text-main">{lesson.title}</p>
                            {lesson.content.length > 0 && (
                              <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed line-clamp-2">
                                {lesson.content[0].split("\n")[0]}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Assignments */}
                    {mod.assignments.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-widest block">
                          Assignment
                        </span>
                        {mod.assignments.map((a, ai) => (
                          <div key={ai} className="flex gap-3 p-3 rounded-xl bg-bg-main border border-border-main">
                            <FileText className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-text-main">{a.title}</p>
                              <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{a.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Phase 2 & 3 Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          {[
            {
              phase: "Phase 2",
              title: "Live Bootcamp Sessions",
              desc: "Intensive live-streamed sessions applying theory to real advisory case studies, negotiation practicals, and regulatory compliance reviews.",
              locked: true,
            },
            {
              phase: "Phase 3",
              title: "Field Practicals",
              desc: "Supervised fieldwork: conduct physical property verifications, assist in advisory transactions, and submit your certified client advisory project.",
              locked: true,
            },
          ].map((p) => (
            <div key={p.phase} className="premium-card rounded-2xl border border-border-main bg-bg-card/50 p-6 opacity-70 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase">
                {p.phase} · Unlocks after Phase 1
              </div>
              <h3 className="font-heading font-bold text-sm text-text-main">{p.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center pt-6 space-y-4">
          <h3 className="text-base font-heading font-bold text-text-main">Ready to become a Certified Property Advisor?</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Submit your application. Each applicant is individually reviewed by the admissions team before enrollment is confirmed.
          </p>
          <Link
            href="/apply"
            className="btn bg-amber-500 text-white hover:brightness-110 px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2 transition-all"
          >
            Apply for HCPA
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
