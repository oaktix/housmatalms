"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { StudentProgress, Meeting, Cohort } from "@/lib/mockData";
import StudentLayout from "@/components/StudentLayout";

export default function StudentMeetings() {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tempSelectedClass, setTempSelectedClass] = useState<string>("");

  const loadStudentData = useCallback(() => {
    if (!currentUser) return;
    const studentId = currentUser.id;
    const studentProgress = db.getProgress(studentId);
    setProgress(studentProgress);

    const studentCohort = db.getStudentCohort(studentId);
    setCohort(studentCohort || null);

    if (studentCohort) {
      setMeetings(db.getMeetings(studentCohort.id));
    }
  }, [currentUser]);

  useEffect(() => {
    loadStudentData();
    db.sync();
    return db.subscribe(loadStudentData);
  }, [loadStudentData]);

  if (!currentUser || !progress) return null;

  // Select Phase 2 Virtual Class
  const handleSelectClass = (className: string) => {
    if (!progress || !currentUser) return;
    const updated = {
      ...progress,
      selected_class: className
    };
    db.updateProgress(updated);
    setProgress(db.getProgress(currentUser.id));
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Intro */}
        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-heading font-extrabold text-text-main flex items-center gap-2">
              Meetings &amp; Live Sessions
              <Calendar className="w-5 h-5 text-primary animate-pulse" />
            </h1>
            <p className="text-xs text-text-muted mt-0.5">Enrolled bootcamps, scheduled tutorials, and attendance reports.</p>
          </div>
          {cohort && (
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-secondary-glow border border-secondary/20 text-secondary">
              {cohort.name}
            </span>
          )}
        </div>

        {/* Phase 2: Live Stream Slots Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-6 shadow-sm">
              <div className="border-b border-border-main pb-4">
                <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Bootcamp Stream Enrollment
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">Choose one of the weekly cohort tutorial times below:</p>
              </div>

              {progress.current_phase < 2 ? (
                <div className="p-4 rounded-xl border border-warning/20 bg-warning/5 text-xs text-warning leading-relaxed flex items-start gap-2.5">
                  <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Digital Bootcamp Enrollment Locked:</span>
                    <span>Complete your Phase 1 self-paced modules to unlock Class stream selections.</span>
                  </div>
                </div>
              ) : !progress.selected_class ? (
                <div className="space-y-4">
                  <div className="p-4 bg-bg-main/30 border border-border-main rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-text-main">July 2026</span>
                      <span className="text-[10px] text-text-muted">Select an active Tuesday slot</span>
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold">
                      {/* Week Headers */}
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                        <div key={d} className="text-text-muted py-1">{d}</div>
                      ))}

                      {/* Empty cells before July 1st (starts on Wednesday, so 3 empty cells) */}
                      {Array(3).fill(null).map((_, i) => (
                        <div key={`empty-${i}`} className="py-2.5 opacity-0" />
                      ))}

                      {/* Day cells for July 2026 */}
                      {Array.from({ length: 31 }, (_, i) => {
                        const day = i + 1;
                        const isTuesday = [7, 14, 21, 28].map(d => d).includes(day);
                        const slotString = isTuesday 
                          ? `Bootcamp Stream - Tuesday July ${day}th, 2026 (4PM)`
                          : null;
                        const isSelected = slotString === tempSelectedClass;

                        return (
                          <div
                            key={day}
                            onClick={() => {
                              if (slotString) {
                                setTempSelectedClass(slotString);
                              }
                            }}
                            className={`py-2 rounded-xl border transition-all text-xs font-black ${
                              isTuesday
                                ? isSelected
                                  ? "border-secondary bg-secondary/15 text-secondary shadow-md cursor-pointer scale-105"
                                  : "border-secondary/40 bg-secondary-glow/5 text-text-main cursor-pointer hover:border-secondary hover:bg-secondary/10"
                                : "border-transparent text-text-muted/20 pointer-events-none"
                            }`}
                          >
                            <span>{day}</span>
                            {isTuesday && (
                              <span className="block text-[6px] text-secondary font-extrabold uppercase mt-0.5 tracking-tighter">
                                {isSelected ? "Selected" : "4PM"}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {tempSelectedClass && (
                    <div className="p-3.5 bg-secondary-glow/10 border border-secondary/15 rounded-2xl text-xs space-y-1.5 animate-fade-in">
                      <span className="text-[9px] font-bold text-secondary uppercase block">Selected Slot details</span>
                      <p className="font-extrabold text-text-main">{tempSelectedClass}</p>
                      <p className="text-[10px] text-text-muted">Requires 1.5 hours live attendance. Session zoom link will unlock 10 mins prior to the start time.</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!tempSelectedClass}
                      onClick={() => handleSelectClass(tempSelectedClass)}
                      className="btn bg-secondary text-white hover:brightness-110 px-6 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                    >
                      Confirm Booking Enrollment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-bg-main border border-border-main flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    <div>
                      <span className="text-[10px] text-text-muted font-bold block uppercase">Enrolled Class</span>
                      <span className="text-xs font-bold text-text-main mt-0.5">{progress.selected_class}</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl border border-secondary/20 bg-secondary/5 space-y-3">
                    <h4 className="font-bold text-xs text-text-main">Live Stream Tutorial Link</h4>
                    {progress.phase2_meeting_url ? (
                      <div className="pt-2 flex justify-between items-center gap-4 border-t border-border-main/40">
                        <span className="text-xs font-semibold text-secondary truncate">{progress.phase2_meeting_url}</span>
                        <a
                          href={progress.phase2_meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn bg-secondary text-white hover:brightness-110 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          Join Now
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-warning italic">
                        Awaiting meeting link from admin. You will receive an email notice when it is ready.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* Scheduled Live Meetings Lists */}
            <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4">
              <h3 className="font-heading font-bold text-xs text-text-main uppercase tracking-wider">
                Meetings Broadcast
              </h3>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {meetings.length === 0 ? (
                  <p className="text-xs text-text-muted italic text-center py-6">No scheduled meetings for your cohort.</p>
                ) : (
                  meetings.map((meet) => (
                    <div key={meet.id} className="p-4 rounded-xl border border-border-main bg-bg-main/30 space-y-2.5">
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="font-bold text-xs text-text-main leading-snug">{meet.topic}</h4>
                      </div>
                      <p className="text-[10px] text-text-muted">
                        Time: {new Date(meet.scheduled_at).toLocaleString()}
                      </p>
                      <a
                        href={meet.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:text-primary-light flex items-center gap-1 font-bold pt-1"
                      >
                        Launch Stream
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
