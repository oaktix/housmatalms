"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, BarChart2, ClipboardCheck, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";

const SURVEY_QUESTIONS = [
  { id: 1, text: "Agent vs. Manager Roles" },
  { id: 2, text: "Nigerian Land Regulations" },
  { id: 3, text: "Digital Management Platforms" },
  { id: 4, text: "Listing Disclosure Protocols" },
  { id: 5, text: "Separation of Client Funds" },
  { id: 6, text: "Move-in Inventory Checks" },
  { id: 7, text: "Habitability & Tenant Rights" },
  { id: 8, text: "Utility & Generator Operations" },
  { id: 9, text: "Real Estate Financials" },
  { id: 10, text: "Eviction & Dispute Mediation" }
];

export default function AdminSurveysPage() {
  const { currentUser } = useAuth();

  const [stats, setStats] = useState({
    preAverages: [] as number[],
    postAverages: [] as number[],
    growths: [] as number[],
    countPre: 0,
    countPost: 0,
    overallPre: 0,
    overallPost: 0,
    maxGrowthTopic: "",
    maxGrowthVal: 0,
    highestPostTopic: "",
    highestPostVal: 0,
    gapReduction: 0
  });

  const [aiSummary, setAiSummary] = useState("");
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  const handleAiSummary = async () => {
    setAiSummaryLoading(true);
    setAiSummary("");
    try {
      const res = await fetch("/api/ai/summarize-surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stats: {
            overallPre: stats.overallPre,
            overallPost: stats.overallPost,
            countPre: stats.countPre,
            countPost: stats.countPost,
            maxGrowthTopic: stats.maxGrowthTopic,
            maxGrowthVal: stats.maxGrowthVal,
            highestPostTopic: stats.highestPostTopic,
            highestPostVal: stats.highestPostVal,
            gapReduction: stats.gapReduction,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setAiSummary(data.result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      alert(`AI survey summary failed: ${msg}`);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const loadSurveyData = () => {
    const allResponses = db.getSurveyResponses();
    const preResponses = allResponses.filter(r => r.type === "pre");
    const postResponses = allResponses.filter(r => r.type === "post");

    const preAverages = Array(10).fill(0);
    const postAverages = Array(10).fill(0);
    let totalPreSum = 0;
    let totalPostSum = 0;
    let preLowScores = 0; // ratings of 1 or 2
    let postLowScores = 0;

    SURVEY_QUESTIONS.forEach((q, idx) => {
      let preSum = 0;
      preResponses.forEach(r => {
        const val = r.answers[q.id] || 0;
        preSum += val;
        if (val === 1 || val === 2) preLowScores++;
      });
      preAverages[idx] = preResponses.length > 0 ? preSum / preResponses.length : 0;
      totalPreSum += preAverages[idx];

      let postSum = 0;
      postResponses.forEach(r => {
        const val = r.answers[q.id] || 0;
        postSum += val;
        if (val === 1 || val === 2) postLowScores++;
      });
      postAverages[idx] = postResponses.length > 0 ? postSum / postResponses.length : 0;
      totalPostSum += postAverages[idx];
    });

    const growths = preAverages.map((pre, idx) => postAverages[idx] - pre);

    // Identify Highest Growth Area
    let maxGrowthIdx = 0;
    let maxGrowthVal = -1;
    growths.forEach((g, idx) => {
      if (g > maxGrowthVal) {
        maxGrowthVal = g;
        maxGrowthIdx = idx;
      }
    });
    const maxGrowthTopic = SURVEY_QUESTIONS[maxGrowthIdx]?.text || "N/A";

    // Identify Highest Post-Course Competency
    let maxPostIdx = 0;
    let maxPostVal = -1;
    postAverages.forEach((p, idx) => {
      if (p > maxPostVal) {
        maxPostVal = p;
        maxPostIdx = idx;
      }
    });
    const highestPostTopic = SURVEY_QUESTIONS[maxPostIdx]?.text || "N/A";

    // Calculate Knowledge Gap Reduction Rate
    const totalPreRatings = preResponses.length * 10;
    const totalPostRatings = postResponses.length * 10;
    const preLowRate = totalPreRatings > 0 ? preLowScores / totalPreRatings : 0;
    const postLowRate = totalPostRatings > 0 ? postLowScores / totalPostRatings : 0;
    const gapReduction = preLowRate > 0 ? Math.round(((preLowRate - postLowRate) / preLowRate) * 100) : 0;

    const overallPre = preAverages.length > 0 ? totalPreSum / preAverages.length : 0;
    const overallPost = postAverages.length > 0 ? totalPostSum / postAverages.length : 0;

    setStats({
      preAverages,
      postAverages,
      growths,
      countPre: preResponses.length,
      countPost: postResponses.length,
      overallPre,
      overallPost,
      maxGrowthTopic,
      maxGrowthVal,
      highestPostTopic,
      highestPostVal: maxPostVal,
      gapReduction
    });
  };

  useEffect(() => {
    loadSurveyData();
    db.sync();
    return db.subscribe(loadSurveyData);
  }, [currentUser]);

  const getInterpretationText = () => {
    if (stats.countPre === 0 || stats.countPost === 0) {
      return "Outcome data is still compiling. Awaiting further pre-course and post-course survey completions from active cohorts.";
    }
    const growthPercent = ((stats.overallPost - stats.overallPre) / 5 * 100).toFixed(0);
    return `Trainees show outstanding educational gains. The overall proficiency rating surged from a baseline of ${stats.overallPre.toFixed(1)}/5.0 to a graduate score of ${stats.overallPost.toFixed(1)}/5.0 (+${growthPercent}% of total scale capacity). Most notably, the student gap of low-confidence ratings was reduced by ${stats.gapReduction}%, validating that the current curriculum successfully eliminates baseline industry knowledge gaps.`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-main pb-4">
        <div className="flex items-center gap-3">
          <Link href="/lms/admin/dashboard" className="p-2 rounded-xl border border-border-main hover:bg-bg-card-hover transition-colors text-text-muted hover:text-text-main">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-heading font-black text-text-main flex items-center gap-2">
              <TrendingUp className="w-5.5 h-5.5 text-primary" />
              Outcome Harvesting Portal
            </h1>
            <p className="text-xs text-text-muted mt-0.5">Statistical measurements of student competency upgrades and knowledge acquisition rates.</p>
          </div>
        </div>
      </div>

      {/* Advanced KPIs Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex flex-col justify-between shadow-sm space-y-4">
          <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Skill Growth Index</span>
          <div>
            <span className="text-2xl font-heading font-black text-primary">
              +{stats.overallPre > 0 ? (stats.overallPost - stats.overallPre).toFixed(1) : "0.0"}
            </span>
            <span className="text-xs text-text-muted font-medium ml-1">rating points</span>
          </div>
          <span className="text-[9px] text-text-muted">Average baseline increase across all 10 topics.</span>
        </div>

        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex flex-col justify-between shadow-sm space-y-4">
          <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Knowledge Gap Reduction</span>
          <div>
            <span className="text-2xl font-heading font-black text-primary">
              {stats.gapReduction}%
            </span>
            <span className="text-xs text-text-muted font-medium ml-1">fewer low scores</span>
          </div>
          <span className="text-[9px] text-text-muted">Reduction rate of 1.0 and 2.0 competence ratings.</span>
        </div>

        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex flex-col justify-between shadow-sm space-y-4">
          <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Highest Growth Dimension</span>
          <div>
            <span className="text-sm font-heading font-black text-text-main block truncate">
              {stats.maxGrowthTopic}
            </span>
            <span className="text-[10px] text-secondary font-extrabold block mt-0.5">
              +{stats.maxGrowthVal.toFixed(1)} absolute leap
            </span>
          </div>
          <span className="text-[9px] text-text-muted">The topic that saw the single largest growth.</span>
        </div>

        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex flex-col justify-between shadow-sm space-y-4">
          <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Post-Course Excellence</span>
          <div>
            <span className="text-sm font-heading font-black text-text-main block truncate">
              {stats.highestPostTopic}
            </span>
            <span className="text-[10px] text-primary font-extrabold block mt-0.5">
              {stats.highestPostVal.toFixed(1)}/5.0 final average
            </span>
          </div>
          <span className="text-[9px] text-text-muted">Topic with the highest final competency average.</span>
        </div>
      </div>

      {/* Main Charts & Interpretation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Detailed Question Chart (7 cols) */}
        <div className="lg:col-span-8 premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
              <BarChart2 className="w-4.5 h-4.5 text-primary" />
              Dimension-by-Dimension Averages
            </h3>
            <p className="text-[10px] text-text-muted mt-0.5">Comparison of initial baseline self-ratings vs final course completions.</p>
          </div>

          <div className="space-y-4.5 border-t border-border-main/50 pt-4">
            {SURVEY_QUESTIONS.map((q, idx) => {
              const preVal = stats.preAverages[idx] || 0;
              const postVal = stats.postAverages[idx] || 0;
              const growth = stats.growths[idx] || 0;

              return (
                <div key={q.id} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-text-main font-semibold">{q.id}. {q.text}</span>
                    <span className="text-text-muted">
                      Pre: <span className="text-text-main font-semibold">{preVal.toFixed(1)}</span> | 
                      Post: <span className="text-primary font-black">{postVal.toFixed(1)}</span>
                      {growth > 0 && (
                        <span className="text-secondary ml-1.5 bg-secondary/10 px-1.5 py-0.5 rounded font-black">
                          +{growth.toFixed(1)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="space-y-1 bg-bg-main/30 p-2.5 rounded-xl border border-border-main/50">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-[8px] text-text-muted uppercase tracking-widest font-black">Pre</span>
                      <div className="flex-1 bg-border-main/50 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary/45 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${(preVal / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-[8px] text-secondary uppercase tracking-widest font-black">Post</span>
                      <div className="flex-1 bg-border-main/50 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-secondary to-accent h-full rounded-full transition-all duration-1000"
                          style={{ width: `${(postVal / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Narrative & Context Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4 shadow-sm">
            <h4 className="font-heading font-bold text-xs uppercase text-text-muted tracking-wider border-b border-border-main pb-2 flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-primary" />
              Impact Interpretation
            </h4>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAiSummary}
                disabled={aiSummaryLoading}
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                {aiSummaryLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" /> AI Summary
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">
              {aiSummary || getInterpretationText()}
            </p>
            <div className="pt-4 border-t border-border-main/50 text-[10px] text-text-muted leading-relaxed">
              <strong>Evaluation Background:</strong> Student ratings are submitted at pre-course intake (upon registration) and post-course completion (directly before graduation certificate issue).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
