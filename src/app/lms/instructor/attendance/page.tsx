"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FileCheck2, Calendar, ChevronRight, AlertCircle, Users, Check, X } from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Cohort, Meeting, Profile } from "@/lib/mockData";

export default function InstructorAttendance() {
  const { currentUser } = useAuth();
  
  // Data States
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeet, setSelectedMeet] = useState<Meeting | null>(null);
  const [students, setStudents] = useState<Profile[]>([]);
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, boolean>>({});

  const [successMsg, setSuccessMsg] = useState("");

  const loadAttendanceData = useCallback(() => {
    if (!currentUser) return;
    
    // Load cohorts managed by this instructor
    const allCohorts = db.getCohorts().filter((c) => c.instructor_id === currentUser.id);
    setCohorts(allCohorts);

    if (allCohorts.length > 0) {
      const activeCohortId = selectedCohortId || allCohorts[0].id;
      if (!selectedCohortId) {
        setSelectedCohortId(activeCohortId);
      }

      // Load meetings for the cohort
      const cohortMeets = db.getMeetings(activeCohortId);
      setMeetings(cohortMeets);
      
      // Load student roster for the cohort
      const cohortStudents = db.getStudentsInCohort(activeCohortId);
      setStudents(cohortStudents);
    }
  }, [currentUser, selectedCohortId]);

  useEffect(() => {
    loadAttendanceData();
    db.sync();
    return db.subscribe(loadAttendanceData);
  }, [loadAttendanceData]);

  // Load existing attendance logs when a meeting is selected
  useEffect(() => {
    if (selectedMeet && students.length > 0) {
      const existingLogs = db.getAttendance(selectedMeet.id);
      
      // Map user_id to present boolean
      const sheet: Record<string, boolean> = {};
      students.forEach((s) => {
        const log = existingLogs.find((l) => l.user_id === s.id);
        sheet[s.id] = log ? log.present : false;
      });
      setAttendanceSheet(sheet);
    }
  }, [selectedMeet, students]);

  const handleToggleAttendance = (studentId: string) => {
    setAttendanceSheet((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeet) return;

    // Save attendance logs
    students.forEach((s) => {
      const isPresent = !!attendanceSheet[s.id];
      db.markAttendance(selectedMeet.id, s.id, isPresent);
    });

    setSuccessMsg("Attendance sheet saved successfully!");
    setTimeout(() => {
      setSuccessMsg("");
    }, 2000);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Header bar */}
      <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-heading font-black text-text-main flex items-center gap-2">
            <FileCheck2 className="w-5.5 h-5.5 text-primary animate-pulse" />
            Live Class Attendance Registry
          </h1>
          <p className="text-xs text-text-muted">Review scheduled meetings and mark students as present or absent for live streams.</p>
        </div>
      </div>

      {cohorts.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-bg-card border border-border-main rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Select Cohort:</span>
            <select
              value={selectedCohortId}
              onChange={(e) => {
                setSelectedCohortId(e.target.value);
                setSelectedMeet(null);
              }}
              className="w-full sm:w-64 px-4 py-2 border border-border-main rounded-xl bg-bg-main text-xs font-bold text-text-main focus:outline-none focus:border-primary transition-all cursor-pointer"
              aria-label="Select Cohort"
              title="Select Cohort"
            >
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[10px] font-extrabold text-text-muted bg-bg-main border border-border-main px-3 py-1 rounded-full uppercase tracking-wider">
            {students.length} Total Students
          </span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-primary-glow border border-primary/25 text-primary text-xs font-semibold rounded-xl animate-fade-in shadow-sm">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Meetings list (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-black text-text-muted uppercase tracking-widest pl-2">
            Scheduled Sessions
          </h3>

          {meetings.length > 0 ? (
            <div className="space-y-2.5">
              {meetings.map((meet) => (
                <button
                  key={meet.id}
                  onClick={() => setSelectedMeet(meet)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedMeet?.id === meet.id
                      ? "bg-primary-glow border-primary text-text-main shadow-sm"
                      : "bg-bg-card border-border-main text-text-muted hover:text-text-main hover:bg-bg-card-hover"
                  }`}
                >
                  <div className="space-y-1 pr-4 min-w-0 flex-grow">
                    <h4 className="font-bold text-text-main text-xs truncate">{meet.topic}</h4>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Scheduled: {new Date(meet.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-bg-card border border-border-main text-center text-xs text-text-muted italic space-y-2 shadow-sm">
              <AlertCircle className="w-6 h-6 mx-auto text-text-muted/65" />
              <p>No scheduled classes found.</p>
              <p className="text-[10px] text-text-muted/85">Go back to the dashboard to schedule a new live class.</p>
            </div>
          )}
        </div>

        {/* Right Column: Attendance Sheet Checklist (7 cols) */}
        <div className="lg:col-span-7">
          {selectedMeet ? (
            <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 sm:p-8 space-y-6 shadow-md animate-fade-in">
              <div className="border-b border-border-main/50 pb-4">
                <span className="text-[9px] font-black uppercase text-primary tracking-widest block">
                  Mark Attendance Sheet
                </span>
                <h3 className="font-heading font-black text-sm sm:text-base text-text-main mt-1 leading-snug">
                  {selectedMeet.topic}
                </h3>
                <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1.5 font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  Scheduled: {new Date(selectedMeet.scheduled_at).toLocaleString()}
                </p>
              </div>

              {students.length > 0 ? (
                <form onSubmit={handleSaveAttendance} className="space-y-4">
                  <div className="space-y-2">
                    {students.map((student) => {
                      const isPresent = !!attendanceSheet[student.id];
                      return (
                        <div
                          key={student.id}
                          onClick={() => handleToggleAttendance(student.id)}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-bg-main border border-border-main hover:bg-bg-card-hover cursor-pointer transition-all text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-text-main block">{student.full_name}</span>
                            <span className="text-[10px] text-text-muted block">{student.email}</span>
                          </div>

                          <div
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors flex items-center gap-1 ${
                              isPresent
                                ? "bg-primary text-text-inverse border-transparent"
                                : "bg-bg-card text-text-muted border-border-main hover:border-error/30 hover:text-error"
                            }`}
                          >
                            {isPresent ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {isPresent ? "Present" : "Absent"}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border-main/50">
                    <button
                      type="submit"
                      className="btn bg-primary text-text-inverse hover:brightness-110 px-8 py-3 rounded-xl text-xs font-black shadow-sm transition-all"
                    >
                      Save Attendance Registry
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-text-muted italic py-4 text-center">No students found in this cohort.</p>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-bg-card border border-border-main rounded-2xl text-xs text-text-muted italic space-y-2 shadow-sm">
              <Users className="w-10 h-10 text-text-muted mx-auto opacity-50" />
              <p>Select a scheduled class from the list to view and mark attendance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
