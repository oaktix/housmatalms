"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Search, ShieldCheck, AlertTriangle } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { db } from "@/lib/db";
import { Profile, Certificate } from "@/lib/mockData";

export default function Verify() {
  const params = useParams();
  const router = useRouter();
  const codeParam = params?.code ? decodeURIComponent(params.code as string) : "";

  const [searchQuery, setSearchQuery] = useState(codeParam !== "HS-LVL1-DEMO" ? codeParam : "");
  const [result, setResult] = useState<{ cert: Certificate; student: Profile; gradStatus: string } | null>(null);
  const [searched, setSearched] = useState(false);
  const [allCertificates, setAllCertificates] = useState<(Certificate & { student?: Profile })[]>([]);

  // Seed default demo certificate if not already present
  useEffect(() => {
    // Check if demo student exists
    const demoStudent = db.getProfileByEmail("adebayo@housmata.test");
    if (demoStudent) {
      const certs = db.getCertificates(demoStudent.id);
      if (certs.length === 0) {
        db.createCertificate(
          demoStudent.id,
          1,
          "Digital Property Management Operator"
        );
      }
    }
  }, []);

  // Fetch all certificates to support search by name
  useEffect(() => {
    const list = db.getCertificates().map((c) => {
      const student = db.getProfile(c.user_id);
      return { ...c, student };
    });
    setAllCertificates(list);
  }, []);

  const performLookup = React.useCallback((query: string) => {
    setErrorMsg("");
    setResult(null);
    setSearched(true);

    if (!query.trim()) return;

    // 1. Search by Certificate Code
    const matchByCode = db.verifyCertificate(query.trim());
    if (matchByCode) {
      const gradStatus = db.getGraduateStatus(matchByCode.student.id);
      setResult({
        cert: matchByCode.cert,
        student: matchByCode.student,
        gradStatus: gradStatus?.deployment_status || "Active",
      });
      return;
    }

    // 2. Search by Student Name (case-insensitive)
    const matchByName = allCertificates.find(
      (item) =>
        item.student?.full_name.toLowerCase().includes(query.toLowerCase())
    );

    if (matchByName && matchByName.student) {
      const gradStatus = db.getGraduateStatus(matchByName.student.id);
      setResult({
        cert: matchByName,
        student: matchByName.student,
        gradStatus: gradStatus?.deployment_status || "Active",
      });
    } else {
      setErrorMsg("No matching verified credentials found in the registry.");
    }
  }, [allCertificates]);

  // Run verification lookup
  useEffect(() => {
    if (codeParam && codeParam !== "search") {
      performLookup(codeParam);
    }
  }, [codeParam, performLookup]);

  const [errorMsg, setErrorMsg] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/verify/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <PublicLayout>
      <section className="relative py-16 md:py-20 border-b border-border-main bg-bg-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(38,196,150,0.08),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-text-main">
            Credential Verification Portal
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Verify the authenticity of Housmata Property Manager certificates. Search by Certificate ID or Student Name.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto pt-4">
            <div className="flex gap-2 p-1.5 bg-bg-main border border-border-main rounded-2xl shadow-sm focus-within:border-primary transition-all">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. HS-LVL1-XXXXXX or student name..."
                className="flex-grow px-3 bg-transparent border-0 text-text-main placeholder-text-muted focus:ring-0 focus:outline-none text-sm"
              />
              <button
                type="submit"
                className="btn bg-primary text-text-inverse hover:brightness-110 px-6 py-2.5 rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-sm transition-all"
              >
                <Search className="w-4 h-4" />
                Lookup
              </button>
            </div>
            <div className="text-[10px] text-text-muted mt-2">
              Try searching the demo certificate:{" "}
              <Link href="/verify/HS-LVL1-DEMO" className="text-primary hover:underline font-bold">
                HS-LVL1-DEMO
              </Link>{" "}
              (Adebayo Mensah)
            </div>
          </form>
        </div>
      </section>

      {/* Lookup results */}
      <section className="py-20 max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        {searched && (
          <div className="animate-fade-in">
            {result ? (
              <div className="premium-card rounded-2xl bg-bg-card border-border-main p-8 text-center space-y-6 shadow-md relative overflow-hidden">
                {/* Visual Security Ribbon */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#26c496] to-[#0891b2]" />

                <div className="w-14 h-14 rounded-full bg-primary-glow border border-primary/20 flex items-center justify-center mx-auto text-primary">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest bg-primary-glow px-2.5 py-1 rounded-full border border-primary/10">
                    VERIFIED CREDENTIAL
                  </span>
                  <h2 className="text-xl font-heading font-bold text-text-main pt-2">
                    {result.student.full_name}
                  </h2>
                  <p className="text-xs text-text-muted">{result.student.email}</p>
                </div>

                <div className="h-px bg-border-main w-full" />

                <div className="grid grid-cols-2 gap-4 text-left text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase block">Certificate Name</span>
                    <span className="font-semibold text-text-main text-xs sm:text-sm">{result.cert.level_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase block">Certificate ID</span>
                    <span className="font-mono font-bold text-text-main text-xs sm:text-sm">{result.cert.certificate_code}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase block">Issue Date</span>
                    <span className="font-semibold text-text-main">{result.cert.issue_date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase block">Deployment Status</span>
                    <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-glow text-primary border border-primary/15">
                      {result.gradStatus}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border-main w-full" />

                <div className="text-[9px] text-text-muted font-mono break-all text-center">
                  <span className="block font-bold mb-0.5">Verification Hash:</span>
                  {result.cert.hash}
                </div>

                <div className="pt-2 text-[10px] text-text-muted leading-relaxed">
                  Issued under the authority of **Property Max Results Ltd.** and the **Housmata Ecosystem**. Certified professionals possess verified training records.
                </div>
              </div>
            ) : (
              <div className="premium-card rounded-2xl bg-bg-card border-border-main p-8 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-error/10 border border-error/25 flex items-center justify-center mx-auto text-error">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-base text-text-main">
                  Lookup Failed
                </h3>
                <p className="text-text-muted text-xs leading-relaxed max-w-xs mx-auto">
                  {errorMsg || "No matching credentials could be located in the Housmata database. Please review the ID spelling."}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
