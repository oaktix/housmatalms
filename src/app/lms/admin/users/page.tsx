"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit3, 
  GraduationCap, 
  ShieldCheck, 
  X, 
  Check, 
  Mail, 
  BookOpen
} from "lucide-react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/useAuth";
import { Profile, Cohort, Instructor } from "@/lib/mockData";

export default function AdminUsersCrud() {
  const { currentUser } = useAuth();

  // Data States
  const [users, setUsers] = useState<Profile[]>([]);
  const [cohorts, setCohortss] = useState<Cohort[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "admin" | "instructor" | "student">("all");

  // Form Panel States
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view" | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Form Inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "instructor" | "student">("student");
  
  // Student cohort input
  const [cohortId, setCohortId] = useState("");

  // Instructor input fields
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [awards, setAwards] = useState("");
  const [philosophy, setPhilosophy] = useState("");

  // UI States
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Load Database Records
  const loadData = useCallback(() => {
    const allUsers = db.getProfiles();
    setUsers(allUsers);
    
    const allCohorts = db.getCohorts();
    setCohortss(allCohorts);
    if (allCohorts.length > 0) {
      setCohortId(allCohorts[0].id);
    }
  }, []);

  useEffect(() => {
    loadData();
    db.sync();
    return db.subscribe(loadData);
  }, [currentUser, loadData]);

  // Form Reset
  const resetForm = () => {
    setFullName("");
    setEmail("");
    setRole("student");
    setBio("");
    setQualifications("");
    setAwards("");
    setPhilosophy("");
    if (cohorts.length > 0) {
      setCohortId(cohorts[0].id);
    }
    setSelectedUserId(null);
  };

  // Trigger Congratulatory Email helper
  const sendCongratsEmail = (studentName: string, studentEmail: string, assignedCohortName: string) => {
    const subject = "Congratulations - Your Student Account has been Created!";
    const body = `Hello ${studentName},

Congratulations! An administrator has officially created your student account at Housmata Academy.

Your student portal credentials and cohort allocation details are shown below:
- Account Name: ${studentName}
- Login Email: ${studentEmail}
- Password: housmata2024
- Allocated Cohort: ${assignedCohortName}

You can log in and start your curriculum at any time here: https://academy.housmata.com/lms/login

We are excited to have you in this session.

Best regards,
Housmata Academy Admissions & Operations Team`;

    db.logEmail(studentEmail, subject, body);
  };

  // Open Create Panel
  const handleOpenCreate = () => {
    resetForm();
    setModalMode("create");
  };

  // Open View Panel
  const handleOpenView = (user: Profile) => {
    resetForm();
    setSelectedUserId(user.id);
    setFullName(user.full_name);
    setEmail(user.email);
    setRole(user.role);

    if (user.role === "student") {
      const currentCohort = db.getStudentCohort(user.id);
      if (currentCohort) {
        setCohortId(currentCohort.id);
      }
    } else if (user.role === "instructor") {
      const instData = db.getInstructorByProfile(user.id);
      if (instData) {
        setBio(instData.bio || "");
        setQualifications(instData.qualifications?.join(", ") || "");
        setAwards(instData.awards?.join(", ") || "");
        setPhilosophy(instData.philosophy || "");
      }
    }
    setModalMode("view");
  };

  // Open Edit Panel
  const handleOpenEdit = (user: Profile) => {
    resetForm();
    setSelectedUserId(user.id);
    setFullName(user.full_name);
    setEmail(user.email);
    setRole(user.role);

    if (user.role === "student") {
      const currentCohort = db.getStudentCohort(user.id);
      if (currentCohort) {
        setCohortId(currentCohort.id);
      }
    } else if (user.role === "instructor") {
      const instData = db.getInstructorByProfile(user.id);
      if (instData) {
        setBio(instData.bio || "");
        setQualifications(instData.qualifications?.join(", ") || "");
        setAwards(instData.awards?.join(", ") || "");
        setPhilosophy(instData.philosophy || "");
      }
    }
    setModalMode("edit");
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!fullName.trim() || !email.trim()) {
      setMessage({ text: "Name and email are required fields.", type: "error" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" });
      return;
    }

    // Email uniqueness check (ignore if editing same user)
    const existing = db.getProfileByEmail(email);
    if (existing && (modalMode === "create" || existing.id !== selectedUserId)) {
      setMessage({ text: `An account with email ${email} already exists.`, type: "error" });
      return;
    }

    if (modalMode === "create") {
      const newUserId = db.generateUUID();
      
      const newProfile: Profile = {
        id: newUserId,
        full_name: fullName,
        email: email,
        role: role,
        created_at: new Date().toISOString(),
      };

      // Save Profile
      db.createProfile(newProfile);

      // Save Role Specific Data
      if (role === "student") {
        if (cohortId) {
          db.enrollOrUpdateCohort(cohortId, newUserId);
        }
        db.updateGraduateStatus(newUserId, "Available", "Student account created by Super Admin.");
        
        // Trigger congratulatory email!
        const cohortObj = cohorts.find(c => c.id === cohortId);
        sendCongratsEmail(fullName, email, cohortObj?.name || "Unassigned");
      } else if (role === "instructor") {
        const newInstructor: Instructor = {
          id: db.generateUUID(),
          profile_id: newUserId,
          full_name: fullName,
          bio: bio,
          qualifications: qualifications.split(",").map(q => q.trim()).filter(Boolean),
          awards: awards.split(",").map(a => a.trim()).filter(Boolean),
          philosophy: philosophy,
        };
        db.createInstructor(newInstructor);
      }

      setMessage({ text: `Account for ${fullName} successfully created!`, type: "success" });
    } else {
      // Edit mode
      if (!selectedUserId) return;
      const originalProfile = db.getProfile(selectedUserId);
      if (!originalProfile) return;

      const updatedProfile: Profile = {
        ...originalProfile,
        full_name: fullName,
        email: email,
        role: role, // Allows changing roles
      };

      db.updateProfile(updatedProfile);

      // Adjust role bindings if changed or updated
      if (role === "student") {
        if (cohortId) {
          db.enrollOrUpdateCohort(cohortId, selectedUserId);
        }
        // Clean up instructor if changed from instructor
        db.deleteInstructorByProfile(selectedUserId);
      } else if (role === "instructor") {
        // Clean up cohort enrollment if changed from student
        db.deleteCohortMember(selectedUserId);
        
        const existingInst = db.getInstructorByProfile(selectedUserId);
        const instPayload: Instructor = {
          id: existingInst?.id || db.generateUUID(),
          profile_id: selectedUserId,
          full_name: fullName,
          bio: bio,
          qualifications: qualifications.split(",").map(q => q.trim()).filter(Boolean),
          awards: awards.split(",").map(a => a.trim()).filter(Boolean),
          philosophy: philosophy,
        };
        
        if (existingInst) {
          db.updateInstructor(instPayload);
        } else {
          db.createInstructor(instPayload);
        }
      } else {
        // Changed to Admin: clean up enrollment & instructor mappings
        db.deleteCohortMember(selectedUserId);
        db.deleteInstructorByProfile(selectedUserId);
      }

      setMessage({ text: `Account for ${fullName} successfully updated!`, type: "success" });
    }

    loadData();
    setTimeout(() => {
      setModalMode(null);
      setMessage(null);
    }, 1200);
  };

  // Delete Handler
  const handleDelete = (id: string) => {
    // Avoid self-deletion
    if (currentUser && currentUser.id === id) {
      alert("Security rule: You cannot delete your own active administrator account.");
      setConfirmDeleteId(null);
      return;
    }

    const victim = db.getProfile(id);
    db.deleteProfile(id);
    setMessage({ text: `Account ${victim?.full_name || ""} successfully deleted.`, type: "success" });
    setConfirmDeleteId(null);
    loadData();

    setTimeout(() => {
      setMessage(null);
    }, 2000);
  };

  // Filtering Logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && u.role === activeTab;
  });

  // Role Metric Computations
  const adminCount = users.filter((u) => u.role === "admin").length;
  const instructorCount = users.filter((u) => u.role === "instructor").length;
  const studentCount = users.filter((u) => u.role === "student").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-main pb-4 gap-4">
        <div>
          <h1 className="text-lg font-heading font-bold text-text-main flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Super Admin User Accounts CRUD
          </h1>
          <p className="text-[10px] text-text-muted mt-1">
            Create, update credentials, assign roles, allocate cohorts, and configure instructor biographies.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn bg-primary text-text-inverse hover:brightness-110 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs shadow-md self-start sm:self-auto transition-transform active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          Add User Account
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-bg-main text-text-main">
            <Users className="w-4 h-4 text-text-muted" />
          </div>
          <div>
            <span className="text-[9px] text-text-muted font-bold block uppercase">Total Accounts</span>
            <span className="text-lg font-heading font-black text-text-main">{users.length}</span>
          </div>
        </div>

        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary-glow text-primary">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] text-text-muted font-bold block uppercase">Administrators</span>
            <span className="text-lg font-heading font-black text-text-main">{adminCount}</span>
          </div>
        </div>

        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-secondary-glow text-secondary">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] text-text-muted font-bold block uppercase">Instructors</span>
            <span className="text-lg font-heading font-black text-text-main">{instructorCount}</span>
          </div>
        </div>

        <div className="premium-card rounded-2xl bg-bg-card border-border-main p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-accent-glow text-accent">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] text-text-muted font-bold block uppercase">Trainees / Students</span>
            <span className="text-lg font-heading font-black text-text-main">{studentCount}</span>
          </div>
        </div>
      </div>

      {/* Operation Messages */}
      {message && (
        <div className={`p-3.5 border rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2 ${
          message.type === "success" 
            ? "bg-primary-glow border-primary/20 text-primary" 
            : "bg-red-950/20 border-red-500/20 text-red-400"
        }`}>
          {message.type === "success" ? <Check className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* User List Panel (Full Width) */}
        <div className="lg:col-span-12 space-y-4">
          <div className="premium-card rounded-2xl bg-bg-card border-border-main p-5 space-y-4">
            {/* Search & Tabs control */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-main pb-4">
              {/* Tab Selector */}
              <div className="flex bg-bg-main p-1 rounded-xl gap-0.5 self-start text-[10px] font-bold">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "all" ? "bg-bg-card text-text-main shadow-sm" : "text-text-muted hover:text-text-main"
                  }`}
                >
                  All ({users.length})
                </button>
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "admin" ? "bg-primary-glow text-primary shadow-sm" : "text-text-muted hover:text-text-main"
                  }`}
                >
                  Admins ({adminCount})
                </button>
                <button
                  onClick={() => setActiveTab("instructor")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "instructor" ? "bg-secondary-glow text-secondary shadow-sm" : "text-text-muted hover:text-text-main"
                  }`}
                >
                  Instructors ({instructorCount})
                </button>
                <button
                  onClick={() => setActiveTab("student")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "student" ? "bg-accent-glow text-accent shadow-sm" : "text-text-muted hover:text-text-main"
                  }`}
                >
                  Students ({studentCount})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-[11px] w-full bg-bg-main rounded-xl border border-border-main placeholder-text-muted text-text-main focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>

            {/* User Directory Table */}
            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-grid text-xs">
                  <thead>
                    <tr>
                      <th className="w-[45%]">User Profile</th>
                      <th className="w-[20%]">System Role</th>
                      <th className="w-[20%]">Cohort/Mapping</th>
                      <th className="w-[15%] text-right font-black uppercase text-[10px] text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const userCohort = user.role === "student" ? db.getStudentCohort(user.id) : undefined;
                      return (
                        <tr 
                          key={user.id} 
                          onClick={() => handleOpenView(user)}
                          className="hover:bg-bg-card-hover transition-colors cursor-pointer"
                        >
                          <td>
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2 rounded-xl text-xs flex-shrink-0 ${
                                user.role === "admin" ? "bg-primary-glow text-primary"
                                : user.role === "instructor" ? "bg-secondary-glow text-secondary"
                                : "bg-accent-glow text-accent"
                              }`}>
                                {user.role === "admin" ? <ShieldCheck className="w-3.5 h-3.5" />
                                 : user.role === "instructor" ? <BookOpen className="w-3.5 h-3.5" />
                                 : <GraduationCap className="w-3.5 h-3.5" />}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-text-main truncate max-w-[150px] sm:max-w-[200px]">{user.full_name}</div>
                                <div className="text-[10px] text-text-muted truncate max-w-[150px] sm:max-w-[200px]">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                              user.role === "admin" ? "bg-primary-glow border-primary/20 text-primary"
                              : user.role === "instructor" ? "bg-secondary-glow border-secondary/20 text-secondary"
                              : "bg-accent-glow border-accent/20 text-accent"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className="text-[10px] text-text-muted font-bold truncate block">
                              {user.role === "student" ? (userCohort?.name || "No Cohort assigned") 
                               : user.role === "instructor" ? "Instructor Profile active" 
                               : "Super Admin privileges"}
                            </span>
                          </td>
                          <td className="text-right">
                            <span className="text-[10px] font-bold text-primary hover:underline">
                              Manage
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-text-muted italic py-10 text-center">No matching accounts found inside directory.</p>
            )}
          </div>
        </div>
      </div>

      {/* Centered Modal Overlay for User details & Actions */}
      {modalMode && (
        <div 
          className="fixed inset-0 bg-bg-main/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => {
            setModalMode(null);
            setConfirmDeleteId(null);
          }}
        >
          <div 
            className="premium-card rounded-2xl bg-bg-card border border-border-main max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-scale-in relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setModalMode(null);
                setConfirmDeleteId(null);
              }}
              className="p-1.5 text-text-muted hover:text-text-main absolute right-4 top-4 rounded-lg hover:bg-bg-main transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>

            {modalMode === "view" ? (
              /* View Details Panel */
              <div className="space-y-5">
                <div className="border-b border-border-main pb-4 flex items-center gap-3">
                  <div className={`p-3.5 rounded-2xl text-xs flex-shrink-0 ${
                    role === "admin" ? "bg-primary-glow text-primary"
                    : role === "instructor" ? "bg-secondary-glow text-secondary"
                    : "bg-accent-glow text-accent"
                  }`}>
                    {role === "admin" ? <ShieldCheck className="w-5.5 h-5.5" />
                     : role === "instructor" ? <BookOpen className="w-5.5 h-5.5" />
                     : <GraduationCap className="w-5.5 h-5.5" />}
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-sm sm:text-base text-text-main">
                      {fullName}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">{email}</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-bg-main/30 border border-border-main p-3.5 rounded-xl space-y-0.5">
                      <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider">System Role</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                        role === "admin" ? "bg-primary-glow border-primary/20 text-primary"
                        : role === "instructor" ? "bg-secondary-glow border-secondary/20 text-secondary"
                        : "bg-accent-glow border-accent/20 text-accent"
                      }`}>
                        {role}
                      </span>
                    </div>

                    <div className="bg-bg-main/30 border border-border-main p-3.5 rounded-xl space-y-0.5">
                      <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider">Access privileges</span>
                      <span className="font-bold text-text-main block">
                        {role === "admin" ? "Admissions & Portal Master"
                         : role === "instructor" ? "Academic Assessor"
                         : "Curriculum Learner"}
                      </span>
                    </div>
                  </div>

                  {role === "student" && (
                    <div className="bg-accent-glow/10 border border-accent/15 p-4 rounded-xl space-y-1 animate-fade-in">
                      <span className="text-[9px] font-bold text-accent uppercase block tracking-widest">Cohort mapping</span>
                      <span className="font-black text-xs text-text-main">
                        {(() => {
                          const userCohort = db.getStudentCohort(selectedUserId || "");
                          return userCohort ? `${userCohort.name} (${userCohort.active ? "Active" : "Archived"})` : "No cohort assigned yet";
                        })()}
                      </span>
                    </div>
                  )}

                  {role === "instructor" && (
                    <div className="bg-secondary-glow/10 border border-secondary/15 p-4 rounded-xl space-y-3.5 animate-fade-in">
                      <span className="text-[9px] font-bold text-secondary uppercase block tracking-widest">Instructor Credentials</span>
                      <div className="space-y-2 leading-relaxed">
                        <p><strong>Biography:</strong> <span className="text-text-muted">{bio || "No biography written."}</span></p>
                        <p><strong>Qualifications:</strong> <span className="text-text-muted">{qualifications || "No qualifications loaded."}</span></p>
                        <p><strong>Awards:</strong> <span className="text-text-muted">{awards || "No awards registered."}</span></p>
                        <p><strong>Teaching Philosophy:</strong> <span className="text-text-muted">{philosophy || "No philosophy entered."}</span></p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Operations Desk inside Modal */}
                <div className="border-t border-border-main/50 pt-4 space-y-3">
                  {confirmDeleteId === selectedUserId ? (
                    <div className="bg-red-950/15 border border-red-500/20 p-4 rounded-xl space-y-3 text-center">
                      <p className="text-[11px] font-bold text-red-400">Are you sure you want to permanently delete this user account?</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => selectedUserId && handleDelete(selectedUserId)}
                          className="text-[10px] font-black px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          Yes, Delete Account
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[10px] font-black px-4 py-2 bg-bg-main border border-border-main text-text-main rounded-lg hover:bg-bg-card-hover transition-colors cursor-pointer"
                        >
                          No, Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          if (selectedUserId) {
                            const u = db.getProfile(selectedUserId);
                            if (u) handleOpenEdit(u);
                          }
                        }}
                        className="btn bg-primary text-text-inverse hover:brightness-110 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Account Details
                      </button>

                      <button
                        onClick={() => selectedUserId && setConfirmDeleteId(selectedUserId)}
                        className="btn bg-red-950/10 border border-red-500/20 text-red-400 hover:bg-red-950/20 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete User
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Create / Edit Form Panel */
              <div className="space-y-4">
                <div className="border-b border-border-main pb-3">
                  <span className="text-[9px] font-extrabold uppercase text-primary tracking-widest block">
                    Credential Form Desk
                  </span>
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-text-main mt-0.5">
                    {modalMode === "create" ? "Create New User" : "Edit User Account"}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="form-group">
                    <label htmlFor="fullName" className="text-[10px] font-bold text-text-muted block mb-1">
                      Full Account Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      placeholder="e.g. Adebayo Adesina"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="text-[10px] font-bold text-text-muted block mb-1">
                      System Login Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="e.g. adebayo@housmata.test"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="role" className="text-[10px] font-bold text-text-muted block mb-1">
                      Select Account Role
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as "admin" | "instructor" | "student")}
                    >
                      <option value="student">🎓 Trainee / Student</option>
                      <option value="instructor">👨‍🏫 Instructor</option>
                      <option value="admin">🛡️ System Administrator</option>
                    </select>
                  </div>

                  {role === "student" && (
                    <div className="form-group bg-accent-glow/30 border border-accent/15 p-3.5 rounded-xl space-y-3.5 animate-fade-in">
                      <span className="text-[9px] font-extrabold uppercase text-accent flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Cohort Enrollment Mapping
                      </span>
                      <div>
                        <label htmlFor="cohortId" className="text-[10px] font-bold text-text-muted block mb-1">
                          Select Cohort Session
                        </label>
                        <select
                          id="cohortId"
                          value={cohortId}
                          onChange={(e) => setCohortId(e.target.value)}
                        >
                          {cohorts.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.active ? "Active" : "Archived"})
                            </option>
                          ))}
                        </select>
                      </div>
                      {modalMode === "create" && (
                        <p className="text-[9px] text-accent font-semibold leading-relaxed flex gap-1 items-start bg-bg-card p-2 rounded-lg">
                          <Mail className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          Creating this student triggers a welcome/congratulations email to their inbox.
                        </p>
                      )}
                    </div>
                  )}

                  {role === "instructor" && (
                    <div className="bg-secondary-glow/20 border border-secondary/15 p-3.5 rounded-xl space-y-3 animate-fade-in">
                      <span className="text-[9px] font-extrabold uppercase text-secondary flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        Instructor Profile Credentials
                      </span>
                      
                      <div className="form-group">
                        <label htmlFor="bio" className="text-[10px] font-bold text-text-muted block mb-1">
                          Instructor biography
                        </label>
                        <textarea
                          id="bio"
                          placeholder="e.g. Over 10 years of property management and legal counseling..."
                          rows={2}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="text-[11px] p-2 bg-bg-main border border-border-main rounded-lg w-full text-text-main placeholder-text-muted focus:border-secondary/50 focus:outline-none"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="qualifications" className="text-[10px] font-bold text-text-muted block mb-1">
                          Qualifications (comma separated)
                        </label>
                        <input
                          type="text"
                          id="qualifications"
                          placeholder="e.g. LL.B, MBA Real Estate, ANIVS"
                          value={qualifications}
                          onChange={(e) => setQualifications(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="awards" className="text-[10px] font-bold text-text-muted block mb-1">
                          Awards & Recognition (comma separated)
                        </label>
                        <input
                          type="text"
                          id="awards"
                          placeholder="e.g. Property Manager of the Year 2024"
                          value={awards}
                          onChange={(e) => setAwards(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="philosophy" className="text-[10px] font-bold text-text-muted block mb-1">
                          Teaching Philosophy
                        </label>
                        <textarea
                          id="philosophy"
                          placeholder="e.g. Empowering practitioners via real-world simulations..."
                          rows={2}
                          value={philosophy}
                          onChange={(e) => setPhilosophy(e.target.value)}
                          className="text-[11px] p-2 bg-bg-main border border-border-main rounded-lg w-full text-text-main placeholder-text-muted focus:border-secondary/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn bg-primary text-text-inverse hover:brightness-110 w-full py-2.5 rounded-xl font-bold text-xs shadow-sm mt-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    {modalMode === "create" ? "Save New Account" : "Apply Modifications"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
