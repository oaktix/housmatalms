"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Award, BookOpen, Heart, Briefcase } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { seedInstructors } from "@/lib/mockData";

export default function Instructors() {
  const director = seedInstructors[0];

  return (
    <PublicLayout>
      {/* Hero Header */}
      <section className="relative py-16 md:py-20 border-b border-border-main bg-bg-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(38,196,150,0.08),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-text-main">
            Meet the Course Director
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
            Housmata Academy is guided by industry leaders with certified academic and global operational expertise, and powered by an AI-assisted learning platform that helps every student train smarter.
          </p>
        </div>
      </section>

      {/* Instructor Profile Details */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Avatar & Quick Info */}
          <div className="lg:col-span-4 space-y-6 text-center lg:text-left">
            <div className="w-56 h-56 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-heading font-black text-text-inverse text-6xl shadow-md mx-auto lg:mx-0">
              AA
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-heading font-bold text-text-main">
                {director.full_name}
              </h2>
              <p className="text-xs text-primary font-bold uppercase tracking-widest">
                Course Director / Handbook Author
              </p>
              <p className="text-xs text-text-muted mt-1">
                CEO, Property Max Results Ltd.
              </p>
            </div>
            <div className="h-px bg-border-main w-full" />
            <div className="space-y-3 text-xs text-text-muted text-left">
              <div className="flex gap-2">
                <Briefcase className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Managing Director & CEO, Property Max Results Ltd.</span>
              </div>
              <div className="flex gap-2">
                <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                <span>MSc Real Estate Management (Napier Edinburgh)</span>
              </div>
              <div className="flex gap-2">
                <Award className="w-4 h-4 text-primary flex-shrink-0" />
                <span> NAR (USA) International Member</span>
              </div>
            </div>
          </div>

          {/* Right Column: Bio details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Bio summary */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-bold text-text-main border-b border-border-main pb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Professional Biography
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                {director.bio}
              </p>
            </div>

            {/* Academic Background */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-bold text-text-main border-b border-border-main pb-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Educational Background
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-text-muted">
                {director.qualifications.map((q, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="text-primary font-bold">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Awards & Recognition */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-bold text-text-main border-b border-border-main pb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Awards & Recognitions
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-text-muted">
                {director.awards.map((aw, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="text-primary font-bold">•</span>
                    <span>{aw}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Leadership Philosophy */}
            <div className="space-y-3 p-6 rounded-2xl bg-bg-card border border-border-main">
              <h3 className="font-heading font-bold text-base text-text-main flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Leadership Philosophy
              </h3>
              <p className="text-xs sm:text-sm text-text-muted italic leading-relaxed">
                &quot;{director.philosophy}&quot;
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-20 space-y-4">
          <h3 className="text-lg font-heading font-bold text-text-main">Study Under Professional Mentors</h3>
          <p className="text-text-muted text-xs max-w-sm mx-auto leading-relaxed">
            Begin your training with the Course Director. Apply now to secure admission into the upcoming cohort.
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
