"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Award, Download, Search } from "lucide-react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/db";
import { Certificate } from "@/lib/mockData";

export default function StudentCredentials() {
  const { currentUser } = useAuth();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      const list = db.getCertificates(currentUser.id);
      setCerts(list);
      if (list.length > 0) {
        setActiveCert(list[0]);
      }
    }
  }, [currentUser]);

  // Generate QR Code when active certificate changes
  useEffect(() => {
    if (activeCert) {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://housmata.academy";
      const verifyUrl = `${origin}/verify/${activeCert.certificate_code}`;
      QRCode.toDataURL(verifyUrl, { width: 100, margin: 1 })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error("Error generating QR", err));
    }
  }, [activeCert]);

  // Client-side PDF Generation with jsPDF
  const downloadPdf = () => {
    if (!activeCert || !currentUser) return;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // We will draw a premium academic certificate directly in PDF vectors!
    // A4 Landscape: width = 297mm, height = 210mm
    
    // Background Slate
    doc.setFillColor(3, 15, 12);
    doc.rect(0, 0, 297, 210, "F");

    // Gold Outer Border
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1.5);
    doc.rect(8, 8, 281, 194, "D");

    // Gold Inner Accent Border
    doc.rect(10, 10, 277, 190, "D");

    // Mint Corners
    doc.setDrawColor(38, 196, 150);
    doc.setLineWidth(2.5);
    // Top-Left Corner
    doc.line(8, 8, 24, 8);
    doc.line(8, 8, 8, 24);
    // Top-Right Corner
    doc.line(289, 8, 273, 8);
    doc.line(289, 8, 289, 24);
    // Bottom-Left Corner
    doc.line(8, 202, 24, 202);
    doc.line(8, 202, 8, 186);
    // Bottom-Right Corner
    doc.line(289, 202, 273, 202);
    doc.line(289, 202, 289, 186);

    // Title Texts
    doc.setTextColor(38, 196, 150); // Mint Green
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("HOUSMATA ACADEMY", 148, 36, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text("ESTATE OPERATOR TRAINING INITIATIVE", 148, 44, { align: "center" });

    // Certificate Name
    doc.setTextColor(212, 175, 55); // Gold
    doc.setFontSize(26);
    doc.setFont("Helvetica", "bold");
    doc.text("CERTIFICATE OF EXCELLENCE", 148, 64, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    doc.text("This is officially awarded to", 148, 78, { align: "center" });

    // Candidate Name
    doc.setTextColor(38, 196, 150);
    doc.setFontSize(28);
    doc.setFont("Helvetica", "bold");
    doc.text(currentUser.full_name, 148, 96, { align: "center" });

    // Graduation Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    doc.text(
      `for successfully completing the required module assessments and capstone simulations for:`,
      148,
      112,
      { align: "center" }
    );
    
    doc.setFont("Helvetica", "bold");
    doc.text(activeCert.level_name.toUpperCase(), 148, 122, { align: "center" });

    // Date & Signatures
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    
    // Left Line (Date)
    doc.line(40, 160, 110, 160);
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text(`DATE OF ISSUE: ${activeCert.issue_date}`, 75, 166, { align: "center" });

    // Right Line (Director)
    doc.line(187, 160, 257, 160);
    doc.setFont("Helvetica", "bold");
    doc.text("AKINWUNMI AWOYODE", 222, 166, { align: "center" });
    doc.setFont("Helvetica", "normal");
    doc.text("Course Director, Property Max", 222, 171, { align: "center" });

    // Embed QR Code
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, "PNG", 133, 142, 30, 30);
    }

    // Code & Hash
    doc.setFontSize(8);
    doc.setFont("Courier", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text(`Cred ID: ${activeCert.certificate_code}`, 148, 185, { align: "center" });
    doc.text(`Verification Hash: ${activeCert.hash}`, 148, 190, { align: "center" });

    // Trigger Save
    doc.save(`housmata-certificate-${activeCert.certificate_code}.pdf`);
  };

  return (
    <div className="space-y-6">
      {certs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Left Column: Certificate list & selector */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-base font-heading font-bold text-text-main">
              Earned Certifications
            </h2>
            <div className="space-y-2">
              {certs.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCert(c)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                    activeCert?.id === c.id
                      ? "bg-primary-glow border-primary text-text-main shadow-sm"
                      : "bg-bg-card border-border-main text-text-muted hover:text-text-main hover:bg-bg-card-hover"
                  }`}
                >
                  <Award className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-xs sm:text-sm text-text-main">
                      {c.level_name}
                    </h3>
                    <span className="font-mono text-[10px] font-bold block">{c.certificate_code}</span>
                    <span className="text-[10px] block">Issued: {c.issue_date}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Explainer for next levels */}
            <div className="p-4 rounded-2xl bg-bg-card border border-border-main text-xs text-text-muted space-y-2.5">
              <span className="font-heading font-bold text-text-main block">Certification Pathway</span>
              <p className="text-[11px] leading-relaxed">
                As a graduate, your status is automatically set to **Active**. To advance to **Level 2 (Certified Estate Manager)**, you must complete 6 months of active operations inside the Housmata ecosystem.
              </p>
            </div>
          </div>

          {/* Right Column: Selected Certificate View */}
          {activeCert && (
            <div className="lg:col-span-8 space-y-6">
              {/* Premium Certificate Graphic Display */}
              <div
                ref={certificateRef}
                className="w-full relative rounded-3xl bg-[#030f0c] border-[6px] border-[#d4af37] p-8 md:p-12 text-center text-white overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] flex flex-col justify-between aspect-[1.414/1] select-none"
              >
                {/* Visual Mint Corner Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />

                <div className="space-y-3">
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-primary tracking-widest block uppercase">
                    Housmata Academy
                  </span>
                  <h3 className="font-heading font-extrabold text-lg sm:text-2xl text-[#d4af37]">
                    CERTIFICATE OF EXCELLENCE
                  </h3>
                  <div className="h-px bg-border-main w-32 mx-auto" />
                  <p className="text-[10px] sm:text-xs text-text-muted italic">
                    This is officially awarded to
                  </p>
                </div>

                <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-primary py-2">
                  {currentUser?.full_name}
                </h1>

                <div className="space-y-4 max-w-lg mx-auto">
                  <p className="text-[10px] sm:text-xs text-text-muted leading-relaxed">
                    for successfully completing the required module assessments and capstone simulations for the certification level of:
                  </p>
                  <p className="font-heading font-extrabold text-xs sm:text-sm tracking-wide text-white uppercase bg-primary-glow border border-primary/25 rounded-xl py-2.5 px-4 inline-block">
                    {activeCert.level_name}
                  </p>
                </div>

                {/* Footer part: Date, Signature & QR Code */}
                <div className="grid grid-cols-3 items-end gap-2 pt-6">
                  {/* Issue Date */}
                  <div className="text-left text-[9px] text-text-muted border-t border-border-main pt-2 space-y-0.5">
                    <span>DATE OF ISSUE</span>
                    <span className="block font-bold text-white">{activeCert.issue_date}</span>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    {qrCodeDataUrl ? (
                      <div className="p-1 bg-white rounded-lg flex items-center justify-center shadow-md">
                        <Image src={qrCodeDataUrl} alt="Verification QR" className="w-16 h-16 sm:w-20 sm:h-20" width={80} height={80} unoptimized />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 animate-pulse rounded-lg" />
                    )}
                  </div>

                  {/* Instructor Signature */}
                  <div className="text-right text-[9px] text-text-muted border-t border-border-main pt-2 space-y-0.5">
                    <span>COURSE DIRECTOR</span>
                    <span className="block font-bold text-white">AKINWUNMI AWOYODE</span>
                  </div>
                </div>

                <div className="text-[8px] text-text-muted/60 font-mono mt-4 flex justify-between px-2 pt-2 border-t border-white/5">
                  <span>Code: {activeCert.certificate_code}</span>
                  <span className="truncate max-w-[200px]">Hash: {activeCert.hash}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={downloadPdf}
                  className="btn bg-primary text-text-inverse hover:brightness-110 px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download PDF Certificate
                </button>
                
                <Link
                  href={`/verify/${activeCert.certificate_code}`}
                  className="btn border border-border-main hover:bg-bg-card-hover text-text-main px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
                >
                  <Search className="w-4 h-4" />
                  Verify on Portal
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-12 text-center space-y-4 shadow-sm animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-border-main flex items-center justify-center mx-auto text-text-muted">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-base text-text-main">No Credentials Earned Yet</h3>
          <p className="text-text-muted text-xs leading-relaxed max-w-sm mx-auto">
            You must complete all core module quizzes and graded assignments. Review your progress in the **Student Dashboard** to complete assessments.
          </p>
          <div className="pt-2">
            <Link
              href="/lms/student/dashboard"
              className="btn bg-primary text-text-inverse hover:brightness-110 px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm"
            >
              Start Learning
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
