"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { db } from "@/lib/db";
import { Cohort } from "@/lib/mockData";

export default function Apply() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    experience: "Beginner",
    motivation: "",
  });

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load available cohorts for the dropdown
    const availableCohorts = db.getCohorts();
    setCohorts(availableCohorts);
    if (availableCohorts.length > 0) {
      setSelectedCohort(availableCohorts[0].id);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.phone || !formData.state || !formData.motivation) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      // Save application
      db.createApplication({
        applicant_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
        experience_level: formData.experience,
        motivation: formData.motivation,
      });

      // Log email confirmation simulation
      db.logEmail(
        formData.email,
        "Housmata Academy - Application Received",
        `Hello ${formData.name},\n\nWe have received your admission application for Housmata Academy.\nOur academic board will review your profile and motivation statement within 3 business days.\n\nThank you,\nHousmata Admissions Office`
      );

      setSubmitted(true);
    } catch {
      setError("This email address has already submitted an application.");
    }
  };

  return (
    <PublicLayout>
      <section className="relative py-16 md:py-20 border-b border-border-main bg-bg-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(38,196,150,0.08),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-text-main">
            Admission Intake Form
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
            Submit your candidate profile below. Accepted applicants are assigned directly to active cohorts.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {!submitted ? (
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-8 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-error/10 border border-error/20 text-error text-xs font-semibold rounded-lg">
                  {error}
                </div>
              )}

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="name" className="text-xs font-extrabold text-text-muted mb-1 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="text-xs font-extrabold text-text-muted mb-1 block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. john@example.com"
                    required
                  />
                </div>
              </div>

              {/* Phone & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="phone" className="text-xs font-extrabold text-text-muted mb-1 block">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +234 809 123 4567"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state" className="text-xs font-extrabold text-text-muted mb-1 block">
                    State of Residence (Nigeria) *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Lagos"
                    required
                  />
                </div>
              </div>

              {/* Cohort Selector & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="cohort" className="text-xs font-extrabold text-text-muted mb-1 block">
                    Select Target Cohort *
                  </label>
                  <select
                    id="cohort"
                    value={selectedCohort}
                    onChange={(e) => setSelectedCohort(e.target.value)}
                  >
                    {cohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="experience" className="text-xs font-extrabold text-text-muted mb-1 block">
                    Real Estate Experience Level *
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                  >
                    <option value="Beginner">Beginner (No experience)</option>
                    <option value="Intermediate">Intermediate (1-2 years)</option>
                    <option value="Advanced">Advanced (3+ years)</option>
                  </select>
                </div>
              </div>

              {/* Motivation */}
              <div className="form-group">
                <label htmlFor="motivation" className="text-xs font-extrabold text-text-muted mb-1 block">
                  Motivation Statement (Why do you want to join Housmata Academy?) *
                </label>
                <textarea
                  id="motivation"
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  placeholder="Explain how this program fits into your career objectives..."
                  rows={4}
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn bg-primary text-text-inverse hover:brightness-110 w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  Submit Application
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-8 text-center space-y-6 shadow-md animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary-glow border border-primary/20 flex items-center justify-center mx-auto text-primary">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-text-main">
                Congratulations, your application has been received!
              </h2>
              <p className="text-text-muted text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                Thank you for applying to Housmata Academy. A confirmation email has been sent to **{formData.email}**. Our admissions board will review your profile and motivation statement within 3 business days.
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/lms"
                className="btn bg-primary text-text-inverse hover:brightness-110 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
              >
                Go to LMS Portal
              </Link>
              <Link
                href="/"
                className="btn border border-border-main hover:bg-bg-card-hover text-text-main px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
