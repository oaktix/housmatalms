"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FileCheck2, Calendar, ChevronRight, AlertCircle } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border-main pb-4">
        <h1 className="text-lg font-heading font-bold text-text-main flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-primary" />
          Attendance Records
        </h1>
      </div>

      {cohorts.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-bg-card border border-border-main rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-text-muted uppercase">Select Cohort:</span>
          <select
            value={selectedCohortId}
            onChange={(e) => {
              setSelectedCohortId(e.target.value);
              setSelectedMeet(null);
            }}
            className="max-w-xs"
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
      )}

      {successMsg && (
        <div className="p-3 bg-primary-glow border border-primary/25 text-primary text-xs font-semibold rounded-lg">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Meetings list (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider pl-2">
            Scheduled Sessions
          </h3>

          {meetings.length > 0 ? (
            <div className="space-y-2">
              {meetings.map((meet) => (
                <button
                  key={meet.id}
                  onClick={() => setSelectedMeet(meet)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedMeet?.id === meet.id
                      ? "bg-primary-glow border-primary text-text-main"
                      : "bg-bg-card border-border-main text-text-muted hover:text-text-main hover:bg-bg-card-hover"
                  }`}
                >
                  <div className="space-y-1 pr-4 min-w-0 flex-grow">
                    <h4 className="font-bold text-text-main text-xs truncate">{meet.topic}</h4>
                    <p className="text-[10px] text-text-muted">
                      Scheduled: {new Date(meet.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-bg-card border border-border-main text-center text-xs text-text-muted italic space-y-1">
              <AlertCircle className="w-5 h-5 mx-auto text-text-muted/65" />
              <p>No scheduled classes found.</p>
              <p className="text-[10px] text-text-muted/80">Schedule classes on the dashboard first.</p>
            </div>
          )}
        </div>

        {/* Right Column: Attendance Sheet Checklist (7 cols) */}
        <div className="lg:col-span-7">
          {selectedMeet ? (
            <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-6 shadow-md animate-fade-in">
              <div className="border-b border-border-main pb-4">
                <span className="text-[9px] font-extrabold uppercase text-primary tracking-widest block">
                  Mark Attendance Sheet
                </span>
                <h3 className="font-heading font-extrabold text-sm sm:text-base text-text-main mt-0.5">
                  {selectedMeet.topic}
                </h3>
                <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Scheduled: {new Date(selectedMeet.scheduled_at).toLocaleString()}
                </p>
              </div>

              {students.length > 0 ? (
                <form onSubmit={handleSaveAttendance} className="space-y-5">
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
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                              isPresent
                                ? "bg-primary text-text-inverse border-transparent"
                                : "bg-bg-card text-text-muted border-border-main"
                            }`}
                          >
                            {isPresent ? "Present" : "Absent"}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    className="btn bg-primary text-text-inverse hover:brightness-110 w-full py-3 rounded-xl font-bold text-xs"
                  >
                    Save Attendance Sheet
                  </button>
                </form>
              ) : (
                <p className="text-xs text-text-muted italic py-6 text-center">No students registered in this cohort.</p>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-text-muted bg-bg-card border border-border-main rounded-2xl italic">
              Select a scheduled session from the left queue to mark attendance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
