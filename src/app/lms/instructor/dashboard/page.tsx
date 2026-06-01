"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Calendar,
  Volume2,
  Clock,
  PlusCircle,
  ExternalLink,
  ClipboardCheck
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

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-glow text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase">Assigned Cohorts</span>
            <span className="text-xl font-heading font-black text-text-main">{cohorts.length}</span>
          </div>
        </div>

        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-glow text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase">Total Students</span>
            <span className="text-xl font-heading font-black text-text-main">
              {cohorts.reduce((sum, c) => sum + db.getStudentsInCohort(c.id).length, 0)}
            </span>
          </div>
        </div>

        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning/10 text-warning">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase">Pending Grading</span>
            <span className="text-xl font-heading font-black text-text-main">{pendingGradingCount}</span>
          </div>
        </div>

        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent-glow text-accent">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold block uppercase">Live Meets Scheduled</span>
            <span className="text-xl font-heading font-black text-text-main">{meetings.length}</span>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-primary-glow border border-primary/25 text-primary text-xs font-semibold rounded-lg">
          {notification}
        </div>
      )}

      {/* Cohort Selector Selector bar */}
      {cohorts.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-bg-card border border-border-main rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-text-muted uppercase">Select Active Cohort:</span>
          <select
            value={selectedCohortId}
            onChange={(e) => setSelectedCohortId(e.target.value)}
            className="max-w-xs"
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Scheduling & Announcements forms (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Announcement Builder */}
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4">
            <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 border-b border-border-main pb-2">
              <Volume2 className="w-4 h-4 text-primary" />
              Publish Cohort Announcement
            </h3>
            
            <form onSubmit={handleAnnSubmit} className="space-y-4">
              <div className="form-group">
                <label htmlFor="annTitle" className="text-[10px] font-bold text-text-muted">Announcement Title</label>
                <input
                  type="text"
                  id="annTitle"
                  placeholder="e.g. Schedule Update or Assignment Tips"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="annContent" className="text-[10px] font-bold text-text-muted">Announcement Content</label>
                <textarea
                  id="annContent"
                  placeholder="Type the message body details..."
                  rows={3}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn bg-primary text-text-inverse hover:brightness-110 w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Publish Update
              </button>
            </form>
          </div>

          {/* Schedule Google Meet Class */}
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4">
            <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 border-b border-border-main pb-2">
              <Calendar className="w-4 h-4 text-primary" />
              Schedule Live Class
            </h3>
            
            <form onSubmit={handleMeetSubmit} className="space-y-4">
              <div className="form-group">
                <label htmlFor="meetTopic" className="text-[10px] font-bold text-text-muted">Class Topic</label>
                <input
                  type="text"
                  id="meetTopic"
                  placeholder="e.g. Day 2: KYC screenings review"
                  value={meetTopic}
                  onChange={(e) => setMeetTopic(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="meetDate" className="text-[10px] font-bold text-text-muted">Schedule Date/Time</label>
                  <input
                    type="datetime-local"
                    id="meetDate"
                    value={meetDate}
                    onChange={(e) => setMeetDate(e.target.value)}
                    required
                    className="dark-scheme"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="meetUrl" className="text-[10px] font-bold text-text-muted">Google Meet URL</label>
                  <input
                    type="text"
                    id="meetUrl"
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={meetUrl}
                    onChange={(e) => setMeetUrl(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn bg-primary text-text-inverse hover:brightness-110 w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
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
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4">
            <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 border-b border-border-main pb-2">
              <Users className="w-4 h-4 text-primary" />
              Cohort Student Roster
            </h3>
            
            {students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-grid">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const grad = db.getGraduateStatus(student.id);
                      return (
                        <tr
                          key={student.id}
                          onClick={() => setSelectedStudentProgress(student)}
                          className="hover:bg-bg-card-hover cursor-pointer transition-colors"
                          title="Click to view student academic progress"
                        >
                          <td>
                            <div className="font-bold text-text-main">{student.full_name}</div>
                          </td>
                          <td className="text-text-muted text-xs">{student.email}</td>
                          <td>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary-glow border border-primary/25 text-primary">
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
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4">
            <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 border-b border-border-main pb-2">
              <Clock className="w-4 h-4 text-primary" />
              Upcoming Meetings
            </h3>
            
            {meetings.length > 0 ? (
              <div className="space-y-3">
                {meetings.map((meet) => (
                  <div
                    key={meet.id}
                    className="p-4 rounded-xl bg-bg-main border border-border-main flex items-center justify-between gap-4 text-xs"
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
                      className="px-3 py-1.5 border border-border-main hover:bg-bg-card-hover text-text-muted hover:text-text-main rounded-lg flex items-center gap-1 font-bold text-[10px] transition-colors"
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
          <div className="w-full max-w-2xl bg-bg-card border border-border-main rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-border-main flex items-center justify-between bg-gradient-to-r from-bg-card to-bg-card/85">
              <div className="space-y-0.5">
                <span className="text-[9px] font-extrabold uppercase text-primary tracking-widest block">
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
                className="p-1.5 rounded-lg border border-border-main hover:bg-bg-card-hover text-text-muted hover:text-text-main transition-colors text-xs font-bold"
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
                className="btn bg-primary text-white hover:brightness-110 px-5 py-2.5 rounded-xl text-xs font-bold"
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
