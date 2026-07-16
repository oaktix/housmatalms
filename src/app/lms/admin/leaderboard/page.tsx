"use client";

import React from "react";
import Leaderboard from "@/components/Leaderboard";
import { Award } from "lucide-react";

export default function AdminLeaderboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between border-b border-border-main pb-4">
        <h1 className="text-xl font-heading font-black text-text-main flex items-center gap-2">
          <Award className="w-5.5 h-5.5 text-accent" />
          Promoted Trainees Leaderboard
        </h1>
        <p className="text-xs text-text-muted hidden sm:block">View outstanding academic performance across all promoted phases.</p>
      </div>
      
      <Leaderboard />
    </div>
  );
}
