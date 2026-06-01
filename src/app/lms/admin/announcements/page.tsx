"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Megaphone, Send, Users, User, Layers, Search, Mail, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Cohort, Profile, Announcement } from "@/lib/mockData";

export default function AdminAnnouncements() {
  const { currentUser } = useAuth();

  // Data States
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Form States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetType, setTargetType] = useState<"global" | "cohort" | "users">("global");
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadData = useCallback(() => {
    // Fetch cohorts
    const allCohorts = db.getCohorts();
    setCohorts(allCohorts);
    if (allCohorts.length > 0 && !selectedCohortId) {
      setSelectedCohortId(allCohorts[0].id);
    }

    // Fetch students
    const allStudents = db.getProfiles().filter((p) => p.role === "student");
    setStudents(allStudents);

    // Fetch announcements
    setAnnouncements(db.getAllAnnouncements());
  }, [selectedCohortId]);

  useEffect(() => {
    loadData();
    db.sync();
    return db.subscribe(loadData);
  }, [currentUser, loadData]);

  // Handle student search filter
  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle user selection
  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredStudents.map((s) => s.id);
    const allSelected = filteredIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!title.trim() || !content.trim()) {
      setMessage({ text: "Please fill in all announcement fields.", type: "error" });
      return;
    }

    let recipientCount = 0;

    if (targetType === "global") {
      // 1. Create global announcement in database (cohort_id = null)
      db.createAnnouncement({
        cohort_id: "",
        title,
        content,
      });

      // 2. Email all students
      students.forEach((s) => {
        db.logEmail(
          s.email,
          `Academy Announcement: ${title}`,
          `Hello ${s.full_name},\n\nA new global announcement has been posted by the administration:\n\n---\n${content}\n---\n\nPlease log in to your dashboard for details.`
        );
      });
      recipientCount = students.length;
    } else if (targetType === "cohort") {
      if (!selectedCohortId) {
        setMessage({ text: "Please select a target cohort.", type: "error" });
        return;
      }

      // 1. Create cohort announcement in database
      db.createAnnouncement({
        cohort_id: selectedCohortId,
        title,
        content,
      });

      // 2. Email all students in cohort
      const cohortStudents = db.getStudentsInCohort(selectedCohortId);
      cohortStudents.forEach((s) => {
        db.logEmail(
          s.email,
          `Cohort Announcement: ${title}`,
          `Hello ${s.full_name},\n\nA new announcement has been posted for your cohort:\n\n---\n${content}\n---\n\nPlease log in to your dashboard for details.`
        );
      });
      recipientCount = cohortStudents.length;
    } else if (targetType === "users") {
      if (selectedUserIds.length === 0) {
        setMessage({ text: "Please select at least one student recipient.", type: "error" });
        return;
      }

      // Email only the selected users directly (personal announcement)
      selectedUserIds.forEach((userId) => {
        const student = students.find((s) => s.id === userId);
        if (student) {
          db.logEmail(
            student.email,
            `Direct Announcement: ${title}`,
            `Hello ${student.full_name},\n\nYou have received a direct announcement from the administration:\n\n---\n${content}\n---\n\nPlease log in to your dashboard for details.`
          );
        }
      });
      recipientCount = selectedUserIds.length;
    }

    setMessage({
      text: `Announcement "${title}" successfully broadcasted to ${recipientCount} student(s)!`,
      type: "success",
    });

    // Reset Form
    setTitle("");
    setContent("");
    setSelectedUserIds([]);
    setSearchQuery("");
    loadData();

    setTimeout(() => setMessage(null), 4000);
  };

  const getCohortName = (cohortId?: string | null) => {
    if (!cohortId) return "All Students (Global)";
    const c = cohorts.find((c) => c.id === cohortId);
    return c ? `Cohort: ${c.name}` : "Unknown Cohort";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border-main pb-4">
        <h1 className="text-lg font-heading font-bold text-text-main flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          Academy Announcements Portal
        </h1>
      </div>

      {message && (
        <div
          className={`p-3 border text-xs font-semibold rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-primary-glow border-primary/25 text-primary"
              : "bg-error/10 border-error/20 text-error"
          }`}
        >
          {message.type === "success" && <ShieldCheck className="w-4 h-4 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Composer Form (5 cols) */}
        <div className="lg:col-span-5">
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4 shadow-md">
            <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 border-b border-border-main pb-2">
              <Send className="w-4 h-4 text-primary" />
              Compose Broadcast
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="text-[10px] font-bold text-text-muted mb-1.5 block">
                  TARGET RECIPIENTS
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetType("global")}
                    className={`py-2 px-3 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                      targetType === "global"
                        ? "bg-primary-glow border-primary text-primary"
                        : "bg-bg-main border-border-main text-text-muted hover:text-text-main"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    All Students
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType("cohort")}
                    className={`py-2 px-3 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                      targetType === "cohort"
                        ? "bg-primary-glow border-primary text-primary"
                        : "bg-bg-main border-border-main text-text-muted hover:text-text-main"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    By Cohort
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType("users")}
                    className={`py-2 px-3 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                      targetType === "users"
                        ? "bg-primary-glow border-primary text-primary"
                        : "bg-bg-main border-border-main text-text-muted hover:text-text-main"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Select Users
                  </button>
                </div>
              </div>

              {/* Cohort Select dropdown */}
              {targetType === "cohort" && (
                <div className="form-group animate-fade-in">
                  <label htmlFor="cohort-select" className="text-[10px] font-bold text-text-muted mb-1 block">
                    Select Target Cohort
                  </label>
                  <select
                    id="cohort-select"
                    value={selectedCohortId}
                    onChange={(e) => setSelectedCohortId(e.target.value)}
                    required
                  >
                    {cohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Student Checklist Selection */}
              {targetType === "users" && (
                <div className="form-group space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-text-muted">
                      Select Students ({selectedUserIds.length} selected)
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="text-[9px] font-bold text-primary hover:underline"
                    >
                      Toggle All Filtered
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search student by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-2 text-xs"
                    />
                  </div>

                  {/* Students list */}
                  <div className="border border-border-main rounded-xl bg-bg-main/50 max-h-[160px] overflow-y-auto p-2 space-y-1">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => {
                        const isChecked = selectedUserIds.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs transition-colors hover:bg-bg-card-hover ${
                              isChecked ? "bg-primary-glow/20 border-l-2 border-primary" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              title={`Select ${s.full_name}`}
                              placeholder={`Select ${s.full_name}`}
                              aria-label={`Select ${s.full_name}`}
                              onChange={() => handleToggleUser(s.id)}
                              className="rounded border-border-main"
                            />
                            <div className="min-w-0">
                              <span className="block font-bold text-text-main truncate text-[11px]">
                                {s.full_name}
                              </span>
                              <span className="block text-[9px] text-text-muted truncate">
                                {s.email}
                              </span>
                            </div>
                          </label>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 text-[10px] text-text-muted">
                        No students found matching your search.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="ann-title" className="text-[10px] font-bold text-text-muted mb-1 block">
                  Announcement Title
                </label>
                <input
                  id="ann-title"
                  type="text"
                  placeholder="e.g. System Maintenance or Cohort Update"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ann-content" className="text-[10px] font-bold text-text-muted mb-1 block">
                  Announcement Body & Content
                </label>
                <textarea
                  id="ann-content"
                  rows={6}
                  placeholder="Compose the announcement details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn bg-primary text-text-inverse hover:brightness-110 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                Publish & Send Broadcast
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Outbound Logs Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4">
            <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 border-b border-border-main pb-2">
              <Mail className="w-4 h-4 text-primary" />
              Published Announcements Log
            </h3>

            {announcements.length > 0 ? (
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                {announcements
                  .slice()
                  .reverse()
                  .map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 rounded-xl border border-border-main bg-bg-main/30 space-y-2.5 transition-all hover:border-primary/20"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-xs text-text-main leading-snug">
                            {ann.title}
                          </h4>
                          <span className="inline-block text-[9px] font-bold text-primary bg-primary-glow border border-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {getCohortName(ann.cohort_id)}
                          </span>
                        </div>
                        <span className="text-[9px] text-text-muted whitespace-nowrap bg-bg-card border border-border-main px-2 py-1 rounded-md">
                          {new Date(ann.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted leading-relaxed whitespace-pre-wrap">
                        {ann.content}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-muted text-xs">
                No database announcements have been recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
