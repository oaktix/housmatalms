"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp, FileText, Sparkles } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { seedModules, seedLessons, seedAssignments } from "@/lib/mockData";

export default function Curriculum() {
  const [activePhase, setActivePhase] = useState<1 | 2>(1);
  const [expandedModule, setExpandedModule] = useState<string | null>("p1-m1");

  const modules = seedModules.filter((m) => m.phase === activePhase);

  const toggleModule = (id: string) => {
    if (expandedModule === id) {
      setExpandedModule(null);
    } else {
      setExpandedModule(id);
    }
  };

  return (
    <PublicLayout>
      {/* Hero Header */}
      <section className="relative py-16 md:py-20 border-b border-border-main bg-bg-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(38,196,150,0.08),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-text-main">
            Housmata Certified Estate Manager
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
            Directly generated from the official Property Max Handbooks and ecosystem training workflows. Focuses on Rent Management &amp; Property Operations.
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
              className="btn bg-primary text-text-inverse hover:brightness-110 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all"
            >
              Apply for HCEM
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Curriculum Tabs & Content */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Phase Selectors */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-1.5 bg-bg-card border border-border-main rounded-2xl mb-12 shadow-sm">
          <button
            onClick={() => {
              setActivePhase(1);
              setExpandedModule("p1-m1");
            }}
            className={`flex-1 text-center py-3.5 rounded-xl font-heading font-bold text-sm transition-all ${
              activePhase === 1
                ? "bg-primary text-text-inverse shadow-sm"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            Phase 1: Foundation Training
          </button>
          <button
            onClick={() => {
              setActivePhase(2);
              setExpandedModule("p2-d1");
            }}
            className={`flex-1 text-center py-3.5 rounded-xl font-heading font-bold text-sm transition-all ${
              activePhase === 2
                ? "bg-primary text-text-inverse shadow-sm"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            Phase 2: 7-Day Bootcamp
          </button>
        </div>

        {/* Phase Descriptions */}
        <div className="mb-10 text-center space-y-2">
          {activePhase === 1 ? (
            <>
              <h2 className="text-xl font-heading font-bold text-text-main">
                Phase 1: Understanding the Real Estate Operating System
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-2xl mx-auto">
                Designed to ground trainees in structural ethics, inspection standards, financial flow controls, property marketing, and documentation frameworks.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-heading font-bold text-text-main">
                Phase 2: 7-Day Intensive Property Management Bootcamp
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-2xl mx-auto">
                A compressed execution sandbox requiring participants to run property uploads, KYC verifications, landlords database management, rent logs, and maintenance ticket distributions.
              </p>
            </>
          )}
        </div>

        {/* AI-Assisted Study Banner */}
        <div className="mb-10 p-5 rounded-2xl border border-primary/20 bg-primary-glow/30 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary text-text-inverse flex items-center justify-center flex-shrink-0">
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

        {/* Modules List */}
        <div className="space-y-4">
          {modules.map((mod) => {
            const isExpanded = expandedModule === mod.id;
            const lessons = seedLessons.filter((l) => l.module_id === mod.id);
            const assignment = seedAssignments.find((a) => a.module_id === mod.id);

            return (
              <div
                key={mod.id}
                className="premium-card rounded-2xl bg-bg-card border-border-main overflow-hidden transition-all duration-300"
              >
                {/* Module Header Trigger */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-bg-card-hover transition-colors"
                >
                  <div className="space-y-1 pr-4">
                    <div className="text-[11px] font-extrabold uppercase text-primary tracking-wider">
                      Module {mod.module_number}
                    </div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-text-main">
                      {mod.title}
                    </h3>
                  </div>
                  <div className="p-2 rounded-lg bg-bg-main border border-border-main text-text-muted">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Module Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-border-main pt-6 bg-bg-main/50 space-y-6 animate-fade-in">
                    {/* Objective */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">
                        Objective
                      </span>
                      <p className="text-xs sm:text-sm text-text-main font-semibold leading-relaxed">
                        {mod.objective}
                      </p>
                    </div>

                    {/* Lessons list */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted block">
                        Lessons breakdown ({lessons.length})
                      </span>
                      {lessons.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {lessons.map((les) => (
                            <div
                              key={les.id}
                              className="p-4 rounded-xl bg-bg-card border border-border-main space-y-1.5"
                            >
                              <span className="text-[10px] font-bold text-primary block">
                                Lesson {les.lesson_number}
                              </span>
                              <h4 className="font-heading font-bold text-xs sm:text-sm text-text-main leading-tight">
                                {les.title}
                              </h4>
                              <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                                {les.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-text-muted italic">Lessons will be generated dynamically during active cohort admission.</p>
                      )}
                    </div>

                    {/* Associated Assignments */}
                    {assignment && (
                      <div className="p-4 rounded-xl border border-primary/20 bg-primary-glow/20 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary">
                          <FileText className="w-4 h-4" />
                          <span>REQUIRED ASSIGNMENT: {assignment.title}</span>
                          <span className="ml-auto text-[10px] bg-primary text-text-inverse px-2 py-0.5 rounded-full">
                            {assignment.points_possible} Points
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-text-muted leading-relaxed">
                          {assignment.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center pt-16 space-y-4">
          <h3 className="text-lg font-heading font-bold text-text-main">Become a Certified Operator</h3>
          <p className="text-text-muted text-xs max-w-sm mx-auto leading-relaxed">
            Apply to begin training under these modules in our upcoming cohort intake.
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
