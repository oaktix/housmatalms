"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Layers, PlusCircle, Users, Edit, Trash2, X } from "lucide-react";
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
  const [editingCohortId, setEditingCohortId] = useState<string | null>(null);

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
    db.sync();
    return db.subscribe(loadCohortData);
  }, [currentUser, loadCohortData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || !instructorId) return;

    if (editingCohortId) {
      db.updateCohort({
        id: editingCohortId,
        name,
        start_date: startDate,
        end_date: endDate,
        capacity: Number(capacity),
        instructor_id: instructorId,
        active: true,
      });
      setMessage(`Cohort "${name}" successfully updated!`);
      setEditingCohortId(null);
    } else {
      db.createCohort({
        name,
        start_date: startDate,
        end_date: endDate,
        capacity: Number(capacity),
        instructor_id: instructorId,
      });
      setMessage(`New cohort "${name}" successfully created!`);
    }

    setName("");
    setStartDate("");
    setEndDate("");
    setCapacity(30);
    if (instructors.length > 0) {
      setInstructorId(instructors[0].id);
    }
    loadCohortData();

    setTimeout(() => setMessage(""), 2500);
  };

  const handleEdit = (cohort: Cohort) => {
    setEditingCohortId(cohort.id);
    setName(cohort.name);
    setStartDate(cohort.start_date);
    setEndDate(cohort.end_date);
    setCapacity(cohort.capacity);
    setInstructorId(cohort.instructor_id);
  };

  const handleCancelEdit = () => {
    setEditingCohortId(null);
    setName("");
    setStartDate("");
    setEndDate("");
    setCapacity(30);
    if (instructors.length > 0) {
      setInstructorId(instructors[0].id);
    }
  };

  const handleDelete = async (cohortId: string, cohortName: string) => {
    if (window.confirm(`Are you sure you want to delete the cohort "${cohortName}"?`)) {
      await db.deleteCohort(cohortId);
      setMessage(`Cohort "${cohortName}" was successfully deleted.`);
      if (editingCohortId === cohortId) {
        handleCancelEdit();
      }
      loadCohortData();
      setTimeout(() => setMessage(""), 2500);
    }
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
        {/* Left Column: Create/Edit Cohort Form (5 cols) */}
        <div className="lg:col-span-5">
          <div className="premium-card rounded-2xl bg-bg-card border border-border-main p-6 space-y-4 shadow-md">
            <h3 className="font-heading font-bold text-sm text-text-main flex items-center justify-between border-b border-border-main pb-2">
              <span className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-primary" />
                {editingCohortId ? "Edit Cohort" : "Create New Cohort"}
              </span>
              {editingCohortId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-text-muted hover:text-text-main p-1 rounded-lg hover:bg-bg-main"
                  title="Cancel Edit"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label htmlFor="name" className="text-[10px] font-bold text-text-muted mb-1 block">
                  Cohort Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary"
                  placeholder="e.g. Cohort Alpha · 2026"
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
                    className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary"
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
                    className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary"
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
                    className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary"
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
                    className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary"
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
                className="btn bg-primary text-white hover:brightness-110 w-full py-2.5 rounded-xl font-bold text-xs transition-all"
              >
                {editingCohortId ? "Save Changes" : "Create Cohort"}
              </button>

              {editingCohortId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn bg-bg-main text-text-main hover:bg-border-main/50 w-full py-2.5 rounded-xl font-bold text-xs transition-all border border-border-main mt-2"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Cohort Inventory List (7 cols) */}
        <div className="lg:col-span-7">
          <div className="premium-card rounded-2xl bg-bg-card border border-border-main p-6 space-y-4 shadow-md">
            <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2 border-b border-border-main pb-2">
              <Layers className="w-4 h-4 text-primary" />
              Active Cohorts Directory
            </h3>

            {cohorts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-grid text-xs w-full text-left">
                  <thead>
                    <tr className="border-b border-border-main/50 text-text-muted font-bold text-[10px] uppercase">
                      <th className="py-2">Cohort Name</th>
                      <th className="py-2">Dates</th>
                      <th className="py-2">Instructor</th>
                      <th className="py-2">Roster</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohorts.map((c) => (
                      <tr key={c.id} className="border-b border-border-main/20 hover:bg-bg-main/20 transition-all">
                        <td className="py-3">
                          <div className="font-bold text-text-main">{c.name}</div>
                          <span className="text-[9px] font-extrabold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            Capacity: {c.capacity} Max
                          </span>
                        </td>
                        <td className="py-3 text-[10px] text-text-muted leading-tight">
                          <div>Start: {c.start_date}</div>
                          <div>End: {c.end_date}</div>
                        </td>
                        <td className="py-3 font-semibold text-text-main text-[11px]">
                          {c.instructor?.full_name || "Akinwunmi Awoyode"}
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 font-bold text-secondary">
                            <Users className="w-3.5 h-3.5" />
                            {c.studentCount} / {c.capacity}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleEdit(c)}
                              className="p-1.5 text-text-muted hover:text-primary hover:bg-primary-glow rounded-lg transition-all"
                              title="Edit Cohort"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id, c.name)}
                              className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-all"
                              title="Delete Cohort"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
