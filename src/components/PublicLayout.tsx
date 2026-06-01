"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import Logo from "./Logo";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Programs", href: "/programs" },
    { name: "Curriculum", href: "/curriculum" },
    { name: "Instructors", href: "/instructors" },
    { name: "Certification", href: "/certification" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-main text-text-main font-sans selection:bg-primary-glow selection:text-primary">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full glass border-b border-border-main transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <Logo height={32} />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive(link.href)
                      ? "text-primary bg-primary-glow"
                      : "text-text-muted hover:text-text-main hover:bg-bg-card-hover"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Header Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/lms"
                className="text-sm font-semibold text-text-muted hover:text-text-main px-4 py-2 transition-all duration-150"
              >
                LMS Portal
              </Link>
              <Link
                href="/apply"
                className="btn bg-primary text-text-inverse hover:brightness-110 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-border-main focus:outline-none transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border-main bg-bg-card transition-all duration-300">
            <div className="px-2 pt-3 pb-6 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-semibold transition-colors ${
                    isActive(link.href)
                      ? "text-primary bg-primary-glow"
                      : "text-text-muted hover:text-text-main hover:bg-bg-card-hover"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-border-main my-4" />
              <div className="grid grid-cols-2 gap-3 px-4">
                <Link
                  href="/lms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl border border-border-main text-text-muted text-sm font-bold hover:bg-bg-card-hover transition-colors"
                >
                  LMS Portal
                </Link>
                <Link
                  href="/apply"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-primary text-text-inverse text-sm font-bold hover:brightness-110 shadow-sm transition-all"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">{children}</main>

      {/* Structured Footer */}
      <footer className="bg-bg-card border-t border-border-main pt-16 pb-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Branding Column */}
            <div className="space-y-4">
              <Logo height={32} />
              <p className="text-text-muted text-xs leading-relaxed max-w-sm">
                Providing standardized training and professional certification for digital estate operators inside the Housmata real estate ecosystem.
              </p>
              <div className="text-xs text-text-muted pt-2">
                <span>© {new Date().getFullYear()} Housmata Technologies Ltd. All rights reserved.</span>
              </div>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider mb-4">
                Academy Links
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/about" className="text-text-muted hover:text-primary text-sm transition-colors">
                    About the Academy
                  </Link>
                </li>
                <li>
                  <Link href="/programs" className="text-text-muted hover:text-primary text-sm transition-colors">
                    Our Programs
                  </Link>
                </li>
                <li>
                  <Link href="/curriculum" className="text-text-muted hover:text-primary text-sm transition-colors">
                    Curriculum Overview
                  </Link>
                </li>
                <li>
                  <Link href="/certification" className="text-text-muted hover:text-primary text-sm transition-colors">
                    Certification Pathway
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/faq" className="text-text-muted hover:text-primary text-sm transition-colors">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-text-muted hover:text-primary text-sm transition-colors">
                    Help & Contact Support
                  </Link>
                </li>
                <li>
                  <Link href="/lms" className="text-text-muted hover:text-primary text-sm transition-colors">
                    Private LMS Login
                  </Link>
                </li>
                <li>
                  <Link href="/verify/HS-LVL1-DEMO" className="text-text-muted hover:text-primary text-sm transition-colors">
                    Verify a Certificate
                  </Link>
                </li>
              </ul>
            </div>

            {/* Office Info Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider mb-4">
                Contact Office
              </h4>
              <div className="text-text-muted text-sm space-y-2">
                <p className="font-semibold text-text-main">Housmata Technologies Ltd</p>
                <p className="text-xs leading-relaxed">10b, Ladoke Akintola Avenue, Aare,<br />Bodija, Ibadan, Oyo State, Nigeria</p>
                <a href="mailto:academy@housmata.com" className="text-xs hover:text-primary transition-colors block">academy@housmata.com</a>
                <a href="tel:+2349075524434" className="text-xs hover:text-primary transition-colors block">+234 907 552 4434</a>
              </div>
            </div>
          </div>

          <div className="h-px bg-border-main my-12" />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-muted">
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-text-main transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-text-main transition-colors">Terms of Service</Link>
            </div>
            <div>
              <span>Designed by Housmata Technologies × Property Max Results</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
