"use client";

import React, { useState, useEffect } from "react";
import { Search, Award, ChevronRight, X, Filter } from "lucide-react";
import { db } from "@/lib/db";
import { phase1Curriculum, hcpaCurriculum } from "@/lib/curriculum";
import StudentProgressSection from "@/components/StudentProgressSection";
import { Profile, Cohort } from "@/lib/mockData";

type LeaderboardEntry = {
  profile: Profile;
  cohort: Cohort | undefined;
  averageScore: number;
  completedModulesCount: number;
  currentPhase: number;
};

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCohortId, setSelectedCohortId] = useState("all");
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [drilldownStudent, setDrilldownStudent] = useState<Profile | null>(null);

  const loadLeaderboardData = () => {
    // 1. Fetch Cohorts for filters
    setCohorts(db.getCohorts());

    // 2. Fetch all student profiles
    const allStudents = db.getProfiles().filter(p => p.role === "student");

    // 3. Process each student to see if promoted and calculate average score
    const processed: LeaderboardEntry[] = allStudents
      .filter(student => {
        const progress = db.getProgress(student.id);
        return progress.current_phase >= 3 || progress.phase2_status === "passed";
      })
      .map(student => {
        const progress = db.getProgress(student.id);
        const cohort = db.getStudentCohort(student.id);

        // Calculate average score over curriculum
        const activeCurriculum = progress.course_id === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;
        let totalScoreSum = 0;
        let gradedCount = 0;

        activeCurriculum.forEach(mod => {
          const finalGrade = db.getFinalModuleGrade(student.id, mod.id);
          if (finalGrade) {
            totalScoreSum += finalGrade.finalGrade;
            gradedCount++;
          }
        });

        const averageScore = gradedCount > 0 ? Number((totalScoreSum / gradedCount).toFixed(1)) : 0;

        return {
          profile: student,
          cohort,
          averageScore,
          completedModulesCount: progress.completed_modules.length,
          currentPhase: progress.current_phase
        };
      })
      // Rank by average score descending, then by completed modules count descending
      .sort((a, b) => {
        if (b.averageScore !== a.averageScore) {
          return b.averageScore - a.averageScore;
        }
        return b.completedModulesCount - a.completedModulesCount;
      });

    setEntries(processed);
  };

  useEffect(() => {
    loadLeaderboardData();
    db.sync();
    return db.subscribe(loadLeaderboardData);
  }, []);

  // Filter entries
  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.profile.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCohort = selectedCohortId === "all" || e.cohort?.id === selectedCohortId;
    return matchesSearch && matchesCohort;
  });

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="premium-card rounded-2xl bg-bg-card border-border-main p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search promoted students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2 bg-bg-main border border-border-main rounded-xl focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-text-muted hidden sm:inline" />
          <select
            value={selectedCohortId}
            onChange={(e) => setSelectedCohortId(e.target.value)}
            className="w-full md:w-56 text-xs bg-bg-main border border-border-main rounded-xl px-3 py-2 text-text-main focus:outline-none focus:border-primary"
          >
            <option value="all">All Cohorts</option>
            {cohorts.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table / Grid */}
      <div className="premium-card rounded-2xl bg-bg-card border-border-main overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border-main flex justify-between items-center bg-bg-card-hover">
          <div>
            <h3 className="font-heading font-black text-sm text-text-main flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Promoted Students Leaderboard
            </h3>
            <p className="text-[10px] text-text-muted mt-1">Ranking of verified students promoted to Phase 3 & Graduate Phase based on overall performance.</p>
          </div>
          <span className="text-[10px] font-black text-accent bg-accent-glow px-3 py-1 rounded-full uppercase tracking-wider">
            {filteredEntries.length} Graduates
          </span>
        </div>

        {filteredEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-main bg-bg-main/50 text-[10px] font-extrabold uppercase text-text-muted tracking-wider">
                  <th className="py-4 px-6 text-center w-16">Rank</th>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Assigned Cohort</th>
                  <th className="py-4 px-6 text-center">Modules Finished</th>
                  <th className="py-4 px-6 text-center">Avg Score</th>
                  <th className="py-4 px-6 text-center">Current Phase</th>
                  <th className="py-4 px-6 text-center w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50 text-xs">
                {filteredEntries.map((entry, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr key={entry.profile.id} className="hover:bg-bg-main/30 transition-colors">
                      <td className="py-4 px-6 text-center font-heading font-black text-sm">
                        {rank === 1 && <span className="inline-flex w-7 h-7 bg-amber-500 text-white rounded-full items-center justify-center shadow-sm" title="1st Place Gold">🥇</span>}
                        {rank === 2 && <span className="inline-flex w-7 h-7 bg-slate-300 text-slate-800 rounded-full items-center justify-center shadow-sm" title="2nd Place Silver">🥈</span>}
                        {rank === 3 && <span className="inline-flex w-7 h-7 bg-amber-700 text-white rounded-full items-center justify-center shadow-sm" title="3rd Place Bronze">🥉</span>}
                        {rank > 3 && <span className="text-text-muted">#{rank}</span>}
                      </td>
                      <td className="py-4 px-6 font-bold text-text-main">
                        <div>
                          <p className="font-heading font-black text-sm">{entry.profile.full_name}</p>
                          <p className="text-[10px] text-text-muted font-normal">{entry.profile.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-text-muted">
                        {entry.cohort?.name || "No Cohort Assigned"}
                      </td>
                      <td className="py-4 px-6 text-center font-bold">
                        {entry.completedModulesCount} modules
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-heading font-black text-sm text-primary bg-primary-glow px-2.5 py-1 rounded-lg">
                          {entry.averageScore}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`font-bold px-2.5 py-0.5 rounded-full border text-[9px] uppercase ${
                          entry.currentPhase === 4 
                            ? "bg-primary-glow border-primary/20 text-primary" 
                            : "bg-accent-glow border-accent/20 text-accent"
                        }`}>
                          Phase {entry.currentPhase === 4 ? "4: Grad" : entry.currentPhase}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => setDrilldownStudent(entry.profile)}
                          className="p-1.5 rounded-lg border border-border-main bg-bg-main hover:bg-bg-card-hover text-text-muted hover:text-text-main transition-all cursor-pointer"
                          title="View student academic breakdown"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-text-muted italic">
            No promoted students match the filter criteria.
          </div>
        )}
      </div>

      {/* Drilldown Modal */}
      {drilldownStudent && (
        <div 
          className="fixed inset-0 bg-bg-main/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setDrilldownStudent(null)}
        >
          <div 
            className="premium-card rounded-2xl bg-bg-card border border-border-main max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-in relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDrilldownStudent(null)}
              className="p-1.5 text-text-muted hover:text-text-main absolute right-4 top-4 rounded-lg hover:bg-bg-main transition-colors"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-border-main pb-4">
              <span className="text-[9px] font-extrabold uppercase text-accent tracking-widest block">
                Academic Portfolio Breakdown
              </span>
              <h3 className="font-heading font-extrabold text-sm sm:text-base text-text-main mt-0.5">
                {drilldownStudent.full_name}
              </h3>
              <p className="text-[10px] text-text-muted mt-1">
                Email: {drilldownStudent.email}
              </p>
            </div>

            <div className="space-y-4">
              <StudentProgressSection studentId={drilldownStudent.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
