"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Layers, PlusCircle, Users } from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Cohort, Profile } from "@/lib/mockData";

type CohortWithDetails = Cohort & { studentCount: number; instructor: Profile | undefined };

export default function AdminCohorts() {
  const { currentUser } = useAuth();

  // Data States
  const [cohorts, setCohorts] = useState<CohortWithDetails[]>([]);
  const [instructors, setInstructors] = useState<Profile[]>([]);

  // Form States
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capacity, setCapacity] = useState<number>(30);
  const [instructorId, setInstructorId] = useState("");

  const [message, setMessage] = useState("");

  const loadCohortData = useCallback(() => {
    // Load all cohorts and map enrolled student counts
    const list = db.getCohorts().map((c) => {
      const studentCount = db.getStudentsInCohort(c.id).length;
      const instructor = db.getProfile(c.instructor_id);
      return { ...c, studentCount, instructor };
    });
    setCohorts(list);

    // Load available instructors for dropdown
    const allInstructors = db.getProfiles().filter((p) => p.role === "instructor");
    setInstructors(allInstructors);
    if (allInstructors.length > 0 && !instructorId) {
      setInstructorId(allInstructors[0].id);
    }
  }, [instructorId]);

  useEffect(() => {
    loadCohortData();
  }, [currentUser, loadCohortData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || !instructorId) return;

    db.createCohort({
      name,
      start_date: startDate,
      end_date: endDate,
      capacity: Number(capacity),
      instructor_id: instructorId,
    });

    setMessage(`New cohort "${name}" successfully created!`);
    setName("");
    setStartDate("");
    setEndDate("");
    loadCohortData();

    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border-main pb-4">
        <h1 className="text-lg font-heading font-bold text-text-main flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Cohort & Intake Management
        </h1>
      </div>

      {message && (
        <div className="p-3 bg-primary-glow border border-primary/25 text-primary text-xs font-semibold rounded-lg">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Create Cohort Form (5 cols) */}
        <div className="lg:col-span-5">
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4 shadow-md">
            <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 border-b border-border-main pb-2">
              <PlusCircle className="w-4 h-4 text-primary" />
              Create New Cohort
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label htmlFor="name" className="text-[10px] font-bold text-text-muted mb-1 block">
                  Cohort Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="e.g. Cohort Gamma 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="startDate" className="text-[10px] font-bold text-text-muted mb-1 block">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate" className="text-[10px] font-bold text-text-muted mb-1 block">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="capacity" className="text-[10px] font-bold text-text-muted mb-1 block">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="instructor" className="text-[10px] font-bold text-text-muted mb-1 block">
                    Assign Instructor
                  </label>
                  <select
                    id="instructor"
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                  >
                    {instructors.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn bg-primary text-text-inverse hover:brightness-110 w-full py-2.5 rounded-xl font-bold text-xs"
              >
                Create Cohort
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Cohort Inventory List (7 cols) */}
        <div className="lg:col-span-7">
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4 shadow-md">
            <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 border-b border-border-main pb-2">
              <Layers className="w-4 h-4 text-primary" />
              Active Cohorts Directory
            </h3>

            {cohorts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-grid text-xs">
                  <thead>
                    <tr>
                      <th>Cohort Name</th>
                      <th>Dates</th>
                      <th>Instructor</th>
                      <th>Roster</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohorts.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="font-bold text-text-main">{c.name}</div>
                          <span className="text-[8px] font-extrabold text-primary bg-primary-glow px-1.5 py-0.5 rounded uppercase">
                            Capacity: {c.capacity} Max
                          </span>
                        </td>
                        <td className="text-[10px] text-text-muted leading-tight">
                          <div>Start: {c.start_date}</div>
                          <div>End: {c.end_date}</div>
                        </td>
                        <td className="font-semibold text-text-main text-[11px]">
                          {c.instructor?.full_name || "Akinwunmi Awoyode"}
                        </td>
                        <td>
                          <span className="inline-flex items-center gap-1 font-bold text-secondary">
                            <Users className="w-3.5 h-3.5" />
                            {c.studentCount} / {c.capacity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-xs text-text-muted italic py-6">
                No active cohorts found. Create one to begin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
