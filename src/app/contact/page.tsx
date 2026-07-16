"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PublicLayout>
      <section className="relative py-16 md:py-20 border-b border-border-main bg-bg-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(38,196,150,0.08),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-text-main">
            Contact Support
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
            Have questions about admission schedules, cohorts, or credential verifications? Get in touch with our office.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left Column: Contact Cards */}
          <div className="md:col-span-5 space-y-6">
            <h2 className="text-xl font-heading font-bold text-text-main">Office Information</h2>
            
            {/* Email Card */}
            <div className="p-5 rounded-2xl premium-card bg-bg-card border-border-main flex gap-4 items-start">
              <div className="p-2.5 rounded-xl bg-primary-glow text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-text-muted uppercase block">Email Support</span>
                <a href="mailto:admissions@housmata.com" className="text-xs hover:text-primary transition-colors block">admissions@housmata.com</a>
              </div>
            </div>

            {/* Phone Card */}
            <div className="p-5 rounded-2xl premium-card bg-bg-card border-border-main flex gap-4 items-start">
              <div className="p-2.5 rounded-xl bg-primary-glow text-primary">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-text-muted uppercase block">Call Support</span>
                <a href="tel:+2349075524434" className="text-sm font-semibold text-text-main hover:text-primary transition-colors">+234 907 552 4434</a>
              </div>
            </div>

            {/* Location Card */}
            <div className="p-5 rounded-2xl premium-card bg-bg-card border-border-main flex gap-4 items-start">
              <div className="p-2.5 rounded-xl bg-primary-glow text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-text-muted uppercase block">Office Location</span>
                <span className="text-sm font-semibold text-text-main">Housmata Technologies Ltd</span>
                <span className="text-xs text-text-muted block leading-relaxed">10b, Ladoke Akintola Avenue, Aare,<br />Bodija, Ibadan, Oyo State, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="md:col-span-7">
            {!submitted ? (
              <div className="p-8 rounded-2xl premium-card bg-bg-card border-border-main shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="name" className="text-xs font-extrabold text-text-muted mb-1 block">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email" className="text-xs font-extrabold text-text-muted mb-1 block">Your Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject" className="text-xs font-extrabold text-text-muted mb-1 block">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Admission inquiry"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message" className="text-xs font-extrabold text-text-muted mb-1 block">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Type your message here..."
                      rows={5}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn bg-primary text-text-inverse hover:brightness-110 w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    Send Message
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-8 rounded-2xl premium-card bg-bg-card border-border-main text-center space-y-4 shadow-sm animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-primary-glow border border-primary/20 flex items-center justify-center mx-auto text-primary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-text-main">Message Sent!</h3>
                <p className="text-text-muted text-xs leading-relaxed max-w-sm mx-auto">
                  Thank you for reaching out. A representative from the admissions office will respond to your inquiry via **{formData.email}** shortly.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn btn-secondary px-5 py-2 rounded-xl text-xs font-bold"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
