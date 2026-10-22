"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  FileCheck2,
  Calendar,
  ChevronRight,
  AlertCircle,
  Users,
  Check,
  X,
  QrCode,
  RefreshCw,
} from "lucide-react";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Cohort, Meeting, Profile } from "@/lib/mockData";
import { Modal } from "@/components/ui/Modal";
import { Button, ShimmerBadge } from "@/components/ui/hashicorp";

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

  // QR Code Session Generator State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrCountdown, setQrCountdown] = useState<number>(60);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadAttendanceData = useCallback(() => {
    if (!currentUser) return;

    const allCohorts = db.getCohorts().filter((c) => c.instructor_id === currentUser.id);
    setCohorts(allCohorts);

    if (allCohorts.length > 0) {
      const activeCohortId = selectedCohortId || allCohorts[0].id;
      if (!selectedCohortId) {
        setSelectedCohortId(activeCohortId);
      }

      const cohortMeets = db.getMeetings(activeCohortId);
      setMeetings(cohortMeets);

      const cohortStudents = db.getStudentsInCohort(activeCohortId);
      setStudents(cohortStudents);
    }
  }, [currentUser, selectedCohortId]);

  useEffect(() => {
    loadAttendanceData();
    db.sync();
    return db.subscribe(loadAttendanceData);
  }, [loadAttendanceData]);

  // Load existing logs
  useEffect(() => {
    if (selectedMeet && students.length > 0) {
      const existingLogs = db.getAttendance(selectedMeet.id);
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

    students.forEach((s) => {
      const isPresent = !!attendanceSheet[s.id];
      db.markAttendance(selectedMeet.id, s.id, isPresent);
    });

    setSuccessMsg("Attendance sheet successfully recorded in central registry.");
    setTimeout(() => {
      setSuccessMsg("");
    }, 2500);
  };

  // Generate QR Code
  const generateQrCode = useCallback(async () => {
    if (!selectedMeet) return;
    const checkinToken = `chk_${selectedMeet.id}_${Date.now()}`;
    const checkinUrl = `${window.location.origin}/lms/student/meetings?checkin=${encodeURIComponent(
      checkinToken
    )}`;

    try {
      const dataUrl = await QRCode.toDataURL(checkinUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrDataUrl(dataUrl);
      setQrCountdown(60);
    } catch (err) {
      console.error("Failed to generate session QR code:", err);
    }
  }, [selectedMeet]);

  const handleOpenQrModal = () => {
    generateQrCode();
    setShowQrModal(true);
  };

  useEffect(() => {
    if (showQrModal) {
      countdownIntervalRef.current = setInterval(() => {
        setQrCountdown((prev) => {
          if (prev <= 1) {
            generateQrCode();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [showQrModal, generateQrCode]);

  if (!currentUser) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Header bar */}
      <div className="rounded-xl bg-surface-1 border border-hairline-soft p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-product-hcem" />
              Live Class Attendance Registry
            </h1>
            <ShimmerBadge variant="waypoint">
              Telemetry
            </ShimmerBadge>
          </div>
          <p className="text-xs text-zinc-400">
            Audit scheduled sessions, record presence, and project rotating QR codes for instantaneous student check-in.
          </p>
        </div>
      </div>

      {cohorts.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-surface-1 border border-hairline-soft rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Cohort:
            </span>
            <select
              value={selectedCohortId}
              onChange={(e) => {
                setSelectedCohortId(e.target.value);
                setSelectedMeet(null);
              }}
              className="w-full sm:w-64 px-3.5 py-2 border border-hairline rounded-md bg-zinc-900 text-xs font-semibold text-white focus:outline-none focus:border-product-hcem transition-all cursor-pointer"
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
          <span className="text-[11px] font-mono text-zinc-400 bg-surface-2 border border-hairline-soft px-3 py-1 rounded-full uppercase tracking-wider">
            {students.length} Enrolled Trainees
          </span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-product-hcem/10 border border-product-hcem/30 text-product-hcem text-xs font-semibold rounded-md animate-fade-in shadow-sm">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Meetings list (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-eyebrow text-zinc-500 font-mono tracking-widest pl-1">
            SCHEDULED SESSIONS
          </h3>

          {meetings.length > 0 ? (
            <div className="space-y-2.5">
              {meetings.map((meet) => (
                <button
                  key={meet.id}
                  onClick={() => setSelectedMeet(meet)}
                  className={`w-full p-4 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedMeet?.id === meet.id
                      ? "bg-product-hcem/10 border-product-hcem text-white shadow-sm"
                      : "bg-surface-1 border-hairline-soft text-zinc-400 hover:text-white hover:bg-surface-2 hover:border-hairline"
                  }`}
                >
                  <div className="space-y-1 pr-4 min-w-0 flex-grow">
                    <h4 className="font-semibold text-white text-xs truncate">{meet.topic}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {new Date(meet.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-lg bg-surface-1 border border-hairline-soft text-center text-xs text-zinc-500 italic space-y-2">
              <AlertCircle className="w-6 h-6 mx-auto text-zinc-600" />
              <p>No scheduled classes found.</p>
              <p className="text-[10px] text-zinc-600">Schedule sessions from the instructor dashboard.</p>
            </div>
          )}
        </div>

        {/* Right Column: Attendance Sheet Checklist (7 cols) */}
        <div className="lg:col-span-7">
          {selectedMeet ? (
            <div className="rounded-xl bg-surface-1 border border-hairline-soft p-6 sm:p-8 space-y-6 shadow-md animate-fade-in">
              <div className="border-b border-hairline-soft pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-eyebrow text-product-hcem font-mono block">
                    SESSION ROSTER
                  </span>
                  <h3 className="font-bold text-base text-white mt-1">
                    {selectedMeet.topic}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    {new Date(selectedMeet.scheduled_at).toLocaleString()}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleOpenQrModal}
                  icon={<QrCode className="w-3.5 h-3.5 text-product-waypoint" />}
                >
                  Project Session QR
                </Button>
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
                          className="flex items-center justify-between p-3.5 rounded-lg bg-zinc-900/60 border border-hairline-soft hover:bg-surface-2 cursor-pointer transition-all text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-semibold text-white block">{student.full_name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono block">{student.email}</span>
                          </div>

                          <div
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
                              isPresent
                                ? "bg-product-hcem text-black border-product-hcem shadow-[0_0_8px_rgba(2,184,117,0.3)]"
                                : "bg-surface-2 text-zinc-500 border-hairline hover:text-zinc-300"
                            }`}
                          >
                            {isPresent ? <Check className="w-3 h-3 text-black stroke-[3]" /> : <X className="w-3 h-3" />}
                            {isPresent ? "Present" : "Absent"}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-hairline-soft">
                    <Button type="submit" variant="primary" size="md">
                      Save Attendance Registry
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-zinc-500 italic py-4 text-center">
                  No registered students located in this cohort.
                </p>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-surface-1 border border-hairline-soft rounded-xl text-xs text-zinc-500 italic space-y-2">
              <Users className="w-10 h-10 text-zinc-600 mx-auto" />
              <p>Select a scheduled session from the queue to verify presence.</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Session Generator Modal */}
      <Modal open={showQrModal} onClose={() => setShowQrModal(false)} variant="center">
        <div className="text-center space-y-5 p-2">
          <div className="space-y-1">
            <ShimmerBadge variant="waypoint" dot>
              Rotating Session Passcode
            </ShimmerBadge>
            <h2 className="text-xl font-bold text-white pt-1">
              Live Attendance Check-In
            </h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Display this encrypted QR code to trainees during live lectures or in-person sessions to log instant presence.
            </p>
          </div>

          {qrDataUrl && (
            <div className="p-4 bg-white rounded-xl inline-block shadow-2xl mx-auto">
              <Image
                src={qrDataUrl}
                alt="Session Check-in QR"
                width={260}
                height={260}
                className="w-64 h-64 mx-auto"
                unoptimized
              />
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-product-waypoint" />
            <span>Refreshes in:</span>
            <span className="font-bold text-white font-mono">{qrCountdown}s</span>
          </div>

          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowQrModal(false)}
            >
              Close Projector Pass
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
