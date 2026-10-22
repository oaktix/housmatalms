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
      {/* Navigation Header - HashiCorp 64px Sticky Console Bar */}
      <header className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-md border-b border-white/10 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Verified Operator Badge */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center">
                <Logo height={32} />
              </Link>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-product-hcem/10 border border-product-hcem/30 text-[10px] font-semibold tracking-wider text-product-hcem uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-product-hcem shadow-[0_0_6px_#02b875]" />
                Academy
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 ${
                      active
                        ? "text-white bg-white/5"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-product-hcem shadow-[0_0_8px_#02b875]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Header Actions - 8px Engineered CTAs */}
            <div className="hidden lg:flex items-center gap-2.5">
              <Link
                href="/lms"
                className="inline-flex items-center justify-center h-9 px-4 rounded-md text-xs font-semibold tracking-tight text-zinc-300 bg-zinc-900 border border-white/10 hover:border-white/20 hover:text-white hover:bg-zinc-800 transition-all"
              >
                LMS Portal
              </Link>
              <Link
                href="/apply"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md text-xs font-semibold tracking-tight bg-white text-black hover:bg-zinc-200 transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 focus:outline-none transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl transition-all duration-300">
            <div className="px-3 pt-3 pb-6 space-y-1 sm:px-4">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3.5 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                      active
                        ? "text-product-hcem bg-product-hcem/10 border-l-2 border-product-hcem"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="h-px bg-white/10 my-3" />
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <Link
                  href="/lms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-md border border-white/10 text-zinc-300 text-xs font-semibold hover:bg-white/5 transition-colors"
                >
                  LMS Portal
                </Link>
                <Link
                  href="/apply"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all shadow-sm"
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

      {/* Structured Premium Footer - Pure Pitch Black Ground */}
      <footer className="relative bg-black border-t border-white/10 pt-20 pb-12 transition-all duration-300 overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute bottom-0 left-[10%] w-[30vw] h-[30vw] rounded-full bg-product-hcem/5 blur-[120px] pointer-events-none select-none" />
        <div className="absolute bottom-0 right-[15%] w-[25vw] h-[25vw] rounded-full bg-product-hcpa/5 blur-[100px] pointer-events-none select-none" />

        {/* Decorative Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-product-hcem/40 to-transparent" />

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
            <svg className="w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none" fill="currentColor">
              {/* Ibadan: Bower's Tower (Left) */}
              <rect x="50" y="30" width="16" height="70" rx="2" />
              <rect x="42" y="20" width="32" height="10" rx="1" />
              <rect x="54" y="5" width="8" height="15" rx="1" />
              <line x1="58" y1="5" x2="58" y2="0" stroke="currentColor" strokeWidth="2" />
              {/* Ibadan: Cocoa House (High Rise) */}
              <rect x="120" y="10" width="40" height="90" rx="1" />
              <rect x="125" y="15" width="30" height="80" fill="none" stroke="currentColor" strokeWidth="1" />
              <line x1="120" y1="25" x2="160" y2="25" stroke="currentColor" />
              <line x1="120" y1="45" x2="160" y2="45" stroke="currentColor" />
              <line x1="120" y1="65" x2="160" y2="65" stroke="currentColor" />
              
              {/* Abuja: Zuma Rock Profile (Center-Left) */}
              <path d="M 280 100 Q 320 25 380 28 Q 440 30 480 100 Z" />
              <path d="M 330 100 Q 350 50 370 100 Z" opacity="0.3" />

              {/* Abuja: National Mosque Domes & Minarets (Center-Right) */}
              <rect x="620" y="15" width="6" height="85" />
              <polygon points="620,15 623,2 626,15" />
              <rect x="710" y="15" width="6" height="85" />
              <polygon points="710,15 713,2 716,15" />
              <path d="M 635 100 A 45 45 0 0 1 705 100 Z" />
              <circle cx="670" cy="50" r="8" />

              {/* Lagos: Lekki-Ikoyi Link Bridge (Right) */}
              <path d="M 850 100 L 910 20 L 970 100 Z" fill="none" stroke="currentColor" strokeWidth="4" />
              <line x1="910" y1="20" x2="910" y2="100" stroke="currentColor" strokeWidth="6" />
              <line x1="870" y1="100" x2="910" y2="45" stroke="currentColor" strokeWidth="1.5" />
              <line x1="890" y1="100" x2="910" y2="65" stroke="currentColor" strokeWidth="1.5" />
              <line x1="950" y1="100" x2="910" y2="45" stroke="currentColor" strokeWidth="1.5" />
              <line x1="930" y1="100" x2="910" y2="65" stroke="currentColor" strokeWidth="1.5" />
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
