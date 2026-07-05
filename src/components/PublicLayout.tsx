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

      {/* Structured Premium Footer */}
      <footer className="relative bg-bg-card border-t border-border-main/80 pt-20 pb-12 transition-all duration-300 overflow-hidden">
        {/* Glamorous glow backgrounds */}
        <div className="absolute bottom-0 left-[10%] w-[30vw] h-[30vw] rounded-full bg-primary/4 blur-[120px] pointer-events-none select-none" />
        <div className="absolute bottom-0 right-[15%] w-[25vw] h-[25vw] rounded-full bg-secondary/4 blur-[100px] pointer-events-none select-none [animation-delay:2s]" />

        {/* Decorative Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_1px_10px_rgba(2,184,117,0.4)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-10">
            {/* Branding Column */}
            <div className="space-y-5">
              <div className="transition-transform duration-300 hover:scale-105 w-fit">
                <Logo height={36} />
              </div>
              <p className="text-text-muted text-xs leading-relaxed max-w-sm">
                Providing standardized training and professional certification for digital estate operators inside the Housmata real estate ecosystem.
              </p>
              <div className="text-[10px] text-text-muted/80 pt-2">
                <span>© {new Date().getFullYear()} Housmata Technologies Ltd. All rights reserved.</span>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-primary uppercase tracking-widest relative pb-2 w-fit">
                Academy Links
                <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-primary rounded-full" />
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-text-muted hover:text-primary text-xs font-semibold transition-all duration-200 hover:pl-1 block">
                    About the Academy
                  </Link>
                </li>
                <li>
                  <Link href="/programs" className="text-text-muted hover:text-primary text-xs font-semibold transition-all duration-200 hover:pl-1 block">
                    Our Programs
                  </Link>
                </li>
                <li>
                  <Link href="/curriculum" className="text-text-muted hover:text-primary text-xs font-semibold transition-all duration-200 hover:pl-1 block">
                    HCEM Curriculum
                  </Link>
                </li>
                <li>
                  <Link href="/curriculum/hcpa" className="text-text-muted hover:text-primary text-xs font-semibold transition-all duration-200 hover:pl-1 block">
                    HCPA Curriculum
                  </Link>
                </li>
                <li>
                  <Link href="/certification" className="text-text-muted hover:text-primary text-xs font-semibold transition-all duration-200 hover:pl-1 block">
                    Certification Pathway
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-primary uppercase tracking-widest relative pb-2 w-fit">
                Resources
                <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-primary rounded-full" />
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/faq" className="text-text-muted hover:text-primary text-xs font-semibold transition-all duration-200 hover:pl-1 block">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-text-muted hover:text-primary text-xs font-semibold transition-all duration-200 hover:pl-1 block">
                    Help &amp; Contact Support
                  </Link>
                </li>
                <li>
                  <Link href="/lms" className="text-text-muted hover:text-primary text-xs font-semibold transition-all duration-200 hover:pl-1 block">
                    Private LMS Login
                  </Link>
                </li>
                <li>
                  <Link href="/verify/HS-LVL1-DEMO" className="text-text-muted hover:text-primary text-xs font-semibold transition-all duration-200 hover:pl-1 block">
                    Verify a Certificate
                  </Link>
                </li>
              </ul>
            </div>

            {/* Office Info Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-primary uppercase tracking-widest relative pb-2 w-fit">
                Contact Office
                <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-primary rounded-full" />
              </h4>
              <div className="text-text-muted text-xs space-y-2.5">
                <p className="font-extrabold text-text-main">Housmata Technologies Ltd</p>
                <p className="leading-relaxed opacity-90">10b, Ladoke Akintola Avenue, Aare,<br />Bodija, Ibadan, Oyo State, Nigeria</p>
                <div className="space-y-1 pt-1">
                  <a href="mailto:academy@housmata.com" className="hover:text-primary transition-colors block font-medium">academy@housmata.com</a>
                  <a href="tel:+2349075524434" className="hover:text-primary transition-colors block font-medium">+234 907 552 4434</a>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border-main/50 my-10" />

          {/* Detailed Silhouette Skyline of Lagos, Abuja, and Ibadan */}
          <div className="w-full h-16 relative overflow-hidden opacity-[0.08] dark:opacity-[0.05] text-text-main transition-opacity pointer-events-none select-none my-4">
            <svg className="w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.5">
              {/* Ibadan: Bower's Tower (Left) */}
              <rect x="50" y="30" width="16" height="70" rx="2" />
              <rect x="42" y="20" width="32" height="10" rx="1" />
              <rect x="54" y="5" width="8" height="15" rx="1" />
              <line x1="58" y1="5" x2="58" y2="0" strokeWidth="2" />
              {/* Ibadan: Cocoa House (High Rise) */}
              <rect x="120" y="10" width="40" height="90" rx="1" />
              <rect x="125" y="15" width="30" height="80" strokeWidth="1" />
              <line x1="120" y1="25" x2="160" y2="25" />
              <line x1="120" y1="45" x2="160" y2="45" />
              <line x1="120" y1="65" x2="160" y2="65" />
              
              {/* Abuja: Zuma Rock Profile (Center-Left) */}
              <path d="M 280 100 Q 320 25 380 28 Q 440 30 480 100" />
              <path d="M 330 100 Q 350 50 370 100" opacity="0.3" />

              {/* Abuja: National Mosque Domes & Minarets (Center-Right) */}
              <rect x="620" y="15" width="6" height="85" />
              <polygon points="620,15 623,2 626,15" />
              <rect x="710" y="15" width="6" height="85" />
              <polygon points="710,15 713,2 716,15" />
              <path d="M 635 100 A 45 45 0 0 1 705 100 Z" />
              <circle cx="670" cy="50" r="8" />

              {/* Lagos: Lekki-Ikoyi Link Bridge (Right) */}
              <path d="M 850 100 L 910 20 L 970 100 Z" strokeWidth="3" />
              <line x1="910" y1="20" x2="910" y2="100" strokeWidth="4" />
              <line x1="870" y1="100" x2="910" y2="45" strokeWidth="1" />
              <line x1="890" y1="100" x2="910" y2="65" strokeWidth="1" />
              <line x1="950" y1="100" x2="910" y2="45" strokeWidth="1" />
              <line x1="930" y1="100" x2="910" y2="65" strokeWidth="1" />
              {/* Lagos: Civic Center/Standard Highrises (Far Right) */}
              <rect x="1040" y="25" width="35" height="75" rx="2" />
              <path d="M 1040 25 L 1075 40 L 1075 100 L 1040 100 Z" opacity="0.4" />
              <rect x="1100" y="40" width="50" height="60" rx="3" />
            </svg>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-text-muted font-medium">
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-text-main transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-text-main transition-colors">Terms of Service</Link>
            </div>
            <div>
              <span className="bg-bg-main border border-border-main/80 px-3.5 py-1.5 rounded-full shadow-sm text-text-main/80 font-semibold">
                Designed by Housmata Technologies × Property Max Results
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
