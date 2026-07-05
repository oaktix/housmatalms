"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, GraduationCap, X, BarChart2 } from "lucide-react";
import { db } from "@/lib/db";
import { phase1Curriculum, hcpaCurriculum } from "@/lib/curriculum";
import { Profile, Cohort } from "@/lib/mockData";
import StudentProgressSection from "@/components/StudentProgressSection";

export default function ProgressTrackerPortal() {
  // Data States
  const [students, setStudents] = useState<Profile[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCohortId, setSelectedCohortId] = useState("all");
  const [selectedPhase, setSelectedPhase] = useState("all");

  // Selected Student Drilldown
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);

  const loadData = useCallback(() => {
    setStudents(db.getProfiles().filter(p => p.role === "student"));
    setCohorts(db.getCohorts());
  }, []);

  useEffect(() => {
    loadData();
    db.sync();
    return db.subscribe(loadData);
  }, [loadData]);

  // Calculations for average grades
  const getAverageGrade = (userId: string, courseId: string) => {
    const activeCurriculum = courseId === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;
    let totalGrade = 0;
    let count = 0;
    activeCurriculum.forEach(mod => {
      const finalGrade = db.getFinalModuleGrade(userId, mod.id);
      if (finalGrade && finalGrade.finalGrade > 0) {
        totalGrade += finalGrade.finalGrade;
        count++;
      }
    });
    return count > 0 ? `${(totalGrade / count).toFixed(1)}%` : "N/A";
  };

  const getProgressPercentage = (userId: string, courseId: string) => {
    const activeCurriculum = courseId === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;
    const progress = db.getProgress(userId);
    const completed = progress.completed_modules.length;
    const total = activeCurriculum.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Filter Logic
  const filteredStudents = students.filter(student => {
    const progress = db.getProgress(student.id);
    const cohort = db.getStudentCohort(student.id);

    const matchesSearch = 
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCohort = selectedCohortId === "all" || (cohort && cohort.id === selectedCohortId);

    const matchesPhase = selectedPhase === "all" || progress.current_phase.toString() === selectedPhase;

    return matchesSearch && matchesCohort && matchesPhase;
  });

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-main pb-4 gap-4">
        <div>
          <h1 className="text-lg font-heading font-black text-text-main flex items-center gap-2">
            <BarChart2 className="w-5.5 h-5.5 text-primary" />
            Trainee Academic Progress Tracker
          </h1>
          <p className="text-[10px] text-text-muted mt-0.5">
            Monitor curriculum module completions, quiz scores, assignment grades, and training phases across all cohorts.
          </p>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="premium-card rounded-2xl bg-bg-card border-border-main p-4 sm:p-5 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student by name/email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs"
          />
        </div>

        {/* Cohort & Phase Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase whitespace-nowrap">Cohort:</span>
            <select
              value={selectedCohortId}
              onChange={(e) => setSelectedCohortId(e.target.value)}
              title="Select Cohort Filter"
              aria-label="Select Cohort Filter"
              className="text-xs py-1.5 px-3 rounded-xl border border-border-main bg-bg-main"
            >
              <option value="all">All Cohorts</option>
              {cohorts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase whitespace-nowrap">Phase:</span>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              title="Select Phase Filter"
              aria-label="Select Phase Filter"
              className="text-xs py-1.5 px-3 rounded-xl border border-border-main bg-bg-main"
            >
              <option value="all">All Phases</option>
              <option value="1">Phase 1: Foundation</option>
              <option value="2">Phase 2: Digital Systems</option>
              <option value="3">Phase 3: Field Practicals</option>
              <option value="4">Phase 4: Graduate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table Matrix */}
      <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 shadow-sm">
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-grid text-xs">
              <thead>
                <tr>
                  <th className="w-[30%]">Trainee / Email</th>
                  <th className="w-[15%]">Cohort</th>
                  <th className="w-[15%]">Active Phase</th>
                  <th className="w-[20%]">Phase 1 Progress</th>
                  <th className="w-[10%]">Avg Grade</th>
                  <th className="w-[10%] text-right uppercase font-black text-primary text-[9px]">Checklist</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const progress = db.getProgress(student.id);
                  const cohort = db.getStudentCohort(student.id);
                  const pct = getProgressPercentage(student.id, progress.course_id || "");

                  return (
                    <tr 
                      key={student.id} 
                      onClick={() => setSelectedStudent(student)}
                      className="hover:bg-bg-card-hover transition-all duration-200 cursor-pointer"
                    >
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl text-xs flex-shrink-0 bg-primary-glow text-primary`}>
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            {(() => {
                              const getBadge = (count: number) => {
                                if (count >= 10) return { name: "Ecosystem Expert 👑", style: "bg-green-950/20 border-green-500/30 text-green-400" };
                                if (count >= 8) return { name: "Specialist ⚡", style: "bg-accent-glow border-accent/20 text-accent" };
                                if (count >= 4) return { name: "Apprentice ⚙️", style: "bg-secondary-glow border-secondary/20 text-secondary" };
                                return { name: "Novice 🌱", style: "bg-bg-main border-border-main text-text-muted" };
                              };
                              const badge = getBadge(progress.completed_modules.length);
                              return (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-text-main truncate block">{student.full_name}</span>
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold border uppercase ${badge.style}`}>
                                    {badge.name}
                                  </span>
                                </div>
                              );
                            })()}
                            <span className="text-[10px] text-text-muted truncate block">{student.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-semibold text-text-main">
                          {cohort?.name || "Unassigned"}
                        </span>
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          progress.current_phase === 1 ? "bg-primary-glow border-primary/20 text-primary"
                          : progress.current_phase === 2 ? "bg-secondary-glow border-secondary/20 text-secondary"
                          : progress.current_phase === 3 ? "bg-accent-glow border-accent/20 text-accent animate-pulse"
                          : "bg-green-950/20 border-green-500/25 text-green-400"
                        }`}>
                          Phase {progress.current_phase}
                        </span>
                      </td>
                      <td>
                        <div className="space-y-1 max-w-[150px]">
                          <div className="flex justify-between items-center text-[9px] font-bold text-text-muted">
                            <span>{progress.completed_modules.length} modules complete</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full bg-bg-main h-1.5 rounded-full overflow-hidden border border-border-main/50">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-bold text-text-main">
                          {getAverageGrade(student.id, progress.course_id || "")}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="text-[10px] font-bold text-primary hover:underline">
                          View details
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-text-muted italic py-12 text-center">No students found matching your filters.</p>
        )}
      </div>

      {/* Drilldown modal overlay */}
      {selectedStudent && (
        <div 
          className="fixed inset-0 bg-bg-main/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedStudent(null)}
        >
          <div 
            className="premium-card rounded-3xl bg-bg-card border border-border-main max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-in relative max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedStudent(null)}
              className="p-1.5 text-text-muted hover:text-text-main absolute right-4 top-4 rounded-lg hover:bg-bg-main transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-border-main pb-4">
              <span className="text-[9px] font-extrabold uppercase text-primary tracking-widest block">
                Academic Progress Checklist
              </span>
              <h3 className="font-heading font-extrabold text-sm sm:text-base text-text-main mt-0.5">
                {selectedStudent.full_name}
              </h3>
              <p className="text-[10px] text-text-muted mt-0.5">{selectedStudent.email}</p>
            </div>

            <StudentProgressSection studentId={selectedStudent.id} />
          </div>
        </div>
      )}
    </div>
  );
}
