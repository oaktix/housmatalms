"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Volume2,
  Clock,
  PlusCircle,
  ExternalLink,
  ClipboardCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Cohort, Profile, Meeting } from "@/lib/mockData";
import StudentProgressSection from "@/components/StudentProgressSection";

export default function InstructorDashboard() {
  const { currentUser } = useAuth();
  
  // Data States
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [students, setStudents] = useState<Profile[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [pendingGradingCount, setPendingGradingCount] = useState(0);

  // Selected Student for Progress View
  const [selectedStudentProgress, setSelectedStudentProgress] = useState<Profile | null>(null);

  // Forms
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [meetTopic, setMeetTopic] = useState("");
  const [meetUrl, setMeetUrl] = useState("");
  const [meetDate, setMeetDate] = useState("");

  const [notification, setNotification] = useState("");

  const loadInstructorData = useCallback(() => {
    if (!currentUser) return;
    
    // Load cohorts managed by this instructor
    const allCohorts = db.getCohorts().filter((c) => c.instructor_id === currentUser.id);
    setCohorts(allCohorts);

    if (allCohorts.length > 0) {
      const activeId = selectedCohortId || allCohorts[0].id;
      if (!selectedCohortId) {
        setSelectedCohortId(activeId);
      }
      
      // Load students in active cohort
      setStudents(db.getStudentsInCohort(activeId));
      // Load meetings in active cohort
      setMeetings(db.getMeetings(activeId));
    }

    // Load total pending grading
    const pending = db.getSubmissions().filter((s) => s.status === "pending").length;
    setPendingGradingCount(pending);
  }, [currentUser, selectedCohortId]);

  useEffect(() => {
    loadInstructorData();
    db.sync();
    return db.subscribe(loadInstructorData);
  }, [loadInstructorData]);

  // Submit Announcement
  const handleAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCohortId || !annTitle || !annContent) return;

    db.createAnnouncement({
      cohort_id: selectedCohortId,
      title: annTitle,
      content: annContent,
    });

    setNotification("Announcement published successfully!");
    setAnnTitle("");
    setAnnContent("");
    loadInstructorData();

    setTimeout(() => setNotification(""), 3000);
  };

  // Submit Meeting
  const handleMeetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCohortId || !meetTopic || !meetUrl || !meetDate) return;

    db.createMeeting({
      cohort_id: selectedCohortId,
      topic: meetTopic,
      meeting_url: meetUrl,
      scheduled_at: new Date(meetDate).toISOString(),
    });

    setNotification("Live class scheduled and students notified!");
    setMeetTopic("");
    setMeetUrl("");
    setMeetDate("");
    loadInstructorData();

    setTimeout(() => setNotification(""), 3000);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      {/* Header Profile Title */}
      <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-black text-text-main flex items-center gap-2">
            Welcome, Instructor {currentUser.full_name}
            <Sparkles className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-xs text-text-muted mt-1">Manage cohorts, issue updates, schedule classes, and assess student submissions.</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-glow border border-primary/20 text-primary uppercase tracking-wider">
          Verified Faculty
        </span>
      </div>

      {/* 1. Header Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-primary-glow text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Assigned Cohorts</span>
            <span className="text-xl font-heading font-black text-text-main">{cohorts.length}</span>
          </div>
        </div>

        <Link href="/lms/instructor/attendance" className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4 hover:border-primary/50 hover:shadow-md transition-all duration-300 group cursor-pointer">
          <div className="p-3 rounded-xl bg-primary-glow text-primary group-hover:scale-110 transition-all duration-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider group-hover:text-primary transition-colors">Total Students</span>
            <span className="text-xl font-heading font-black text-text-main">
              {cohorts.reduce((sum, c) => sum + db.getStudentsInCohort(c.id).length, 0)}
            </span>
          </div>
        </Link>

        <Link href="/lms/instructor/grading" className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4 hover:border-warning/50 hover:shadow-md transition-all duration-300 group cursor-pointer">
          <div className="p-3 rounded-xl bg-warning/10 text-warning group-hover:scale-110 transition-all duration-300">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider group-hover:text-warning transition-colors">Pending Grading</span>
            <span className="text-xl font-heading font-black text-text-main">{pendingGradingCount}</span>
          </div>
        </Link>

        <a href="#meetings-section" className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4 hover:border-accent/50 hover:shadow-md transition-all duration-300 group cursor-pointer">
          <div className="p-3 rounded-xl bg-accent-glow text-accent group-hover:scale-110 transition-all duration-300">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider group-hover:text-accent transition-colors">Live Meets</span>
            <span className="text-xl font-heading font-black text-text-main">{meetings.length}</span>
          </div>
        </a>
      </div>

      {notification && (
        <div className="p-4 bg-primary-glow border border-primary/25 text-primary text-xs font-semibold rounded-xl animate-fade-in shadow-sm">
          {notification}
        </div>
      )}

      {/* Cohort Selector Selector bar */}
      {cohorts.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-bg-card border border-border-main rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Active Cohort Manager:</span>
            <div className="relative">
              <select
                value={selectedCohortId}
                onChange={(e) => setSelectedCohortId(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-border-main rounded-xl bg-bg-main text-xs font-bold text-text-main focus:outline-none focus:border-primary transition-all cursor-pointer"
                aria-label="Select Active Cohort"
                title="Select Active Cohort"
              >
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-text-muted bg-bg-main border border-border-main px-3 py-1 rounded-full uppercase tracking-wider">
            {students.length} Enrolled Students
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Scheduling & Announcements forms (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Announcement Builder */}
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4 shadow-sm">
            <h3 className="font-heading font-extrabold text-sm text-text-main flex items-center gap-2 border-b border-border-main/50 pb-3">
              <Volume2 className="w-4 h-4 text-primary" />
              Publish Cohort Announcement
            </h3>
            
            <form onSubmit={handleAnnSubmit} className="space-y-4">
              <div className="form-group flex flex-col gap-1">
                <label htmlFor="annTitle" className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Announcement Title</label>
                <input
                  type="text"
                  id="annTitle"
                  placeholder="e.g. Schedule Update or Assignment Tips"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-border-main rounded-xl bg-bg-main text-xs text-text-main focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label htmlFor="annContent" className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Announcement Content</label>
                <textarea
                  id="annContent"
                  placeholder="Type the message body details..."
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-border-main rounded-xl bg-bg-main text-xs text-text-main focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="btn bg-primary text-text-inverse hover:brightness-115 w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Publish Announcement
              </button>
            </form>
          </div>

          {/* Schedule Google Meet Class */}
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4 shadow-sm">
            <h3 className="font-heading font-extrabold text-sm text-text-main flex items-center gap-2 border-b border-border-main/50 pb-3">
              <Calendar className="w-4 h-4 text-primary" />
              Schedule Live Class
            </h3>
            
            <form onSubmit={handleMeetSubmit} className="space-y-4">
              <div className="form-group flex flex-col gap-1">
                <label htmlFor="meetTopic" className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Class Topic</label>
                <input
                  type="text"
                  id="meetTopic"
                  placeholder="e.g. Day 2: KYC screenings review"
                  value={meetTopic}
                  onChange={(e) => setMeetTopic(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-border-main rounded-xl bg-bg-main text-xs text-text-main focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label htmlFor="meetDate" className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Schedule Date/Time</label>
                <input
                  type="datetime-local"
                  id="meetDate"
                  value={meetDate}
                  onChange={(e) => setMeetDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-border-main rounded-xl bg-bg-main text-xs text-text-main focus:outline-none focus:border-primary transition-all dark-scheme"
                />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label htmlFor="meetUrl" className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Google Meet URL</label>
                <input
                  type="text"
                  id="meetUrl"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={meetUrl}
                  onChange={(e) => setMeetUrl(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-border-main rounded-xl bg-bg-main text-xs text-text-main focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <button
                type="submit"
                className="btn bg-primary text-text-inverse hover:brightness-115 w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Calendar className="w-4 h-4" />
                Schedule Class
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Cohort Roster & Meetings list (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cohort student roster */}
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4 shadow-sm">
            <h3 className="font-heading font-extrabold text-sm text-text-main flex items-center gap-2 border-b border-border-main/50 pb-3">
              <Users className="w-4 h-4 text-primary" />
              Cohort Student Roster
            </h3>
            
            {students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-grid w-full text-left">
                  <thead>
                    <tr className="border-b border-border-main text-[10px] font-black uppercase text-text-muted">
                      <th className="py-2.5">Name</th>
                      <th className="py-2.5">Email</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/40">
                    {students.map((student) => {
                      const grad = db.getGraduateStatus(student.id);
                      return (
                        <tr
                          key={student.id}
                          onClick={() => setSelectedStudentProgress(student)}
                          className="hover:bg-bg-card-hover cursor-pointer transition-colors group"
                          title="Click to view student academic progress"
                        >
                          <td className="py-3">
                            <div className="font-bold text-text-main text-xs group-hover:text-primary transition-colors flex items-center gap-1">
                              {student.full_name}
                              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                            </div>
                          </td>
                          <td className="py-3 text-text-muted text-xs">{student.email}</td>
                          <td className="py-3">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-primary-glow border border-primary/25 text-primary">
                              {grad ? grad.deployment_status : "Active"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-text-muted italic py-4 text-center">No students enrolled in this cohort.</p>
            )}
          </div>

          {/* Scheduled Meetings list */}
          <div id="meetings-section" className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4 shadow-sm">
            <h3 className="font-heading font-extrabold text-sm text-text-main flex items-center gap-2 border-b border-border-main/50 pb-3">
              <Clock className="w-4 h-4 text-primary" />
              Upcoming Meetings
            </h3>
            
            {meetings.length > 0 ? (
              <div className="space-y-3">
                {meetings.map((meet) => (
                  <div
                    key={meet.id}
                    className="p-4 rounded-xl bg-bg-main border border-border-main flex items-center justify-between gap-4 text-xs shadow-sm hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-text-main">{meet.topic}</h4>
                      <p className="text-[10px] text-text-muted">
                        Time: {new Date(meet.scheduled_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <a
                      href={meet.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 border border-border-main hover:bg-bg-card-hover text-text-muted hover:text-text-main rounded-xl flex items-center gap-1 font-bold text-[10px] transition-all"
                    >
                      Join Link
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic py-4 text-center">No upcoming meetings scheduled.</p>
            )}
          </div>
        </div>
      </div>

      {/* Student Progress Modal */}
      {selectedStudentProgress && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-bg-card border border-border-main rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-border-main flex items-center justify-between bg-gradient-to-r from-bg-card to-bg-card/85">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase text-primary tracking-widest block">
                  Student Academic Progress
                </span>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-text-main">
                  {selectedStudentProgress.full_name}
                </h3>
                <p className="text-xs text-text-muted">{selectedStudentProgress.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentProgress(null)}
                className="px-3 py-1.5 rounded-lg border border-border-main hover:bg-bg-card-hover text-text-muted hover:text-text-main transition-colors text-xs font-bold"
              >
                Close
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <StudentProgressSection studentId={selectedStudentProgress.id} />
            </div>
            
            <div className="p-4 border-t border-border-main bg-bg-main/55 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentProgress(null)}
                className="btn bg-primary text-text-inverse hover:brightness-110 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm"
              >
                Close Progress View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
