"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { db } from "@/lib/db";
import { Cohort } from "@/lib/mockData";
import {
  Button,
  SpotlightCard,
  ShimmerBadge,
  HairlineDivider,
} from "@/components/ui/hashicorp";

export default function Apply() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    experience: "Beginner",
    motivation: "",
    courseId: "real-estate-os",
  });

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const availableCohorts = db.getCohorts();
    setCohorts(availableCohorts);
    if (availableCohorts.length > 0) {
      setSelectedCohort(availableCohorts[0].id);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.state ||
      !formData.motivation
    ) {
      setError("Please complete all required fields before submitting.");
      return;
    }

    const existingProfile = db.getProfileByEmail(formData.email);
    if (existingProfile && existingProfile.role === "student") {
      const progress = db.getProgress(existingProfile.id);
      if (progress && progress.current_phase < 3) {
        setError(
          `You are already enrolled in a course track (${
            progress.course_id === "property-advisor-hcpa" ? "HCPA" : "HCEM"
          }) and have not completed Phase 2. You must reach Phase 3 (Field Practicals) before applying for a second track.`
        );
        return;
      }
    }

    try {
      await db.createApplication({
        applicant_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
        experience_level: formData.experience,
        motivation: formData.motivation,
        course_id: formData.courseId as "real-estate-os" | "property-advisor-hcpa",
      });

      db.logEmail(
        formData.email,
        "Housmata Academy - Application Received",
        `Hello ${formData.name},\n\nWe have received your admission application for Housmata Academy.\nOur academic board will review your profile and motivation statement within 3 business days.\n\nThank you,\nHousmata Admissions Office`
      );

      db.logEmail(
        "myhousmata@gmail.com",
        `New Admission Application Submitted: ${formData.name}`,
        `Hello Admin,\n\nA new admission application has been submitted on the website.\n\nApplicant Details:\n- Name: ${formData.name}\n- Email: ${formData.email}\n- Phone: ${formData.phone}\n- State: ${formData.state}\n- Experience Level: ${formData.experience}\n- Motivation: ${formData.motivation}\n\nPlease review this application in the admin portal.\n\nBest regards,\nHousmata Website System`
      );

      setSubmitted(true);
    } catch {
      setError("This email address has already submitted an active admission application.");
    }
  };

  return (
    <PublicLayout>
      <div className="bg-black text-white min-h-screen selection:bg-product-hcem/20 selection:text-product-hcem">
        <section className="relative py-20 md:py-24 border-b border-white/10 bg-black overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(2,184,117,0.08),transparent_50%)]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <ShimmerBadge variant="hcem" dot className="mb-4">
              Cohort Admissions // 2026 Intake
            </ShimmerBadge>
            <h1 className="text-display-lg font-bold tracking-tight text-white max-w-2xl mx-auto">
              Candidate Admission Form
            </h1>
            <p className="text-body-lg text-zinc-400 max-w-xl mx-auto mt-4 leading-relaxed">
              Submit your operator profile below. Qualified candidates are vetted weekly by the academic board and assigned to active cohorts.
            </p>
          </div>
        </section>

        <section className="py-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {!submitted ? (
            <SpotlightCard
              variant="surface-2"
              radius="xl"
              interactive={false}
              className="p-8 sm:p-10 bg-zinc-950 border-white/10 shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3.5 bg-product-consul/10 border border-product-consul/30 text-product-consul text-xs font-semibold rounded-md">
                    {error}
                  </div>
                )}

                {/* Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="text-eyebrow text-zinc-400 block font-mono"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Babatunde Adeleke"
                      className="w-full h-11 px-3.5 rounded-md bg-zinc-900 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-product-hcem focus:ring-1 focus:ring-product-hcem transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="text-eyebrow text-zinc-400 block font-mono"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. b.adeleke@example.com"
                      className="w-full h-11 px-3.5 rounded-md bg-zinc-900 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-product-hcem focus:ring-1 focus:ring-product-hcem transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Phone & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="phone"
                      className="text-eyebrow text-zinc-400 block font-mono"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+234 809 123 4567"
                      className="w-full h-11 px-3.5 rounded-md bg-zinc-900 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-product-hcem focus:ring-1 focus:ring-product-hcem transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="state"
                      className="text-eyebrow text-zinc-400 block font-mono"
                    >
                      State of Residence *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Lagos, Abuja, Oyo"
                      className="w-full h-11 px-3.5 rounded-md bg-zinc-900 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-product-hcem focus:ring-1 focus:ring-product-hcem transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Track Selection */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="courseId"
                    className="text-eyebrow text-zinc-400 block font-mono"
                  >
                    Target Certification Track *
                  </label>
                  <select
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    className="w-full h-11 px-3.5 rounded-md bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-product-hcem focus:ring-1 focus:ring-product-hcem transition-all"
                  >
                    <option value="real-estate-os">
                      Housmata Certified Estate Manager (HCEM) — Rent &amp; Operations
                    </option>
                    <option value="property-advisor-hcpa">
                      Housmata Certified Property Advisor (HCPA) — Advisory &amp; Title Verification
                    </option>
                  </select>
                </div>

                {/* Cohort Selector & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="cohort"
                      className="text-eyebrow text-zinc-400 block font-mono"
                    >
                      Target Cohort *
                    </label>
                    <select
                      id="cohort"
                      value={selectedCohort}
                      onChange={(e) => setSelectedCohort(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-md bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-product-hcem focus:ring-1 focus:ring-product-hcem transition-all"
                    >
                      {cohorts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="experience"
                      className="text-eyebrow text-zinc-400 block font-mono"
                    >
                      Real Estate Experience Level *
                    </label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full h-11 px-3.5 rounded-md bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-product-hcem focus:ring-1 focus:ring-product-hcem transition-all"
                    >
                      <option value="Beginner">Beginner (No prior real estate experience)</option>
                      <option value="Intermediate">Intermediate (1–2 years practice)</option>
                      <option value="Advanced">Advanced (3+ years practice)</option>
                    </select>
                  </div>
                </div>

                {/* Motivation */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="motivation"
                    className="text-eyebrow text-zinc-400 block font-mono"
                  >
                    Motivation Statement *
                  </label>
                  <textarea
                    id="motivation"
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleChange}
                    placeholder="Describe how mastering this certification track will elevate your property management or advisory career..."
                    rows={4}
                    className="w-full p-3.5 rounded-md bg-zinc-900 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-product-hcem focus:ring-1 focus:ring-product-hcem transition-all"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Submit Application for Board Review
                  </Button>
                </div>
              </form>
            </SpotlightCard>
          ) : (
            <SpotlightCard
              variant="hcem"
              radius="xl"
              className="p-10 bg-zinc-950 border-white/10 text-center space-y-6 shadow-2xl animate-fade-in"
            >
              <div className="w-16 h-16 rounded-full bg-product-hcem/10 border border-product-hcem/30 flex items-center justify-center mx-auto text-product-hcem shadow-[0_0_20px_rgba(2,184,117,0.2)]">
                <ClipboardCheck className="w-8 h-8" />
              </div>
              <div className="space-y-3">
                <ShimmerBadge variant="hcem">
                  Application Logged
                </ShimmerBadge>
                <h2 className="text-2xl font-bold text-white">
                  Admission Dossier Under Review
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                  Your candidate profile has been recorded and an email confirmation dispatched to{" "}
                  <strong className="text-white">{formData.email}</strong>. The academic admissions board will review your credentials within 3 business days.
                </p>
              </div>

              <HairlineDivider variant="subtle" />

              <div className="pt-2 flex flex-wrap gap-3 justify-center">
                <Button variant="secondary" size="md" href="/">
                  Return to Home
                </Button>
                <Button variant="hcem" size="md" href="/lms">
                  Access LMS Portal
                </Button>
              </div>
            </SpotlightCard>
          )}
        </section>
      </div>
    </PublicLayout>
  );
}
