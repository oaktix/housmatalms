import { generatedQuizzes, generatedQuizQuestions } from "./generatedQuizzes";
import { generatedQuizQuestions2 } from "./generatedQuizzes2";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  avatar_url?: string;
  created_at: string;
  course_id?: "real-estate-os" | "property-advisor-hcpa";
}

export interface StudentProgress {
  user_id: string;
  course_id?: "real-estate-os" | "property-advisor-hcpa";
  current_phase: 1 | 2 | 3 | 4; // 4 = certified
  completed_modules: string[];
  read_lessons?: string[]; // tracks specific lesson IDs read: e.g., "module-1-lesson-0"
  phase2_status: "locked" | "in-progress" | "passed" | "failed";
  selected_class?: string;
  phase2_meeting_url?: string;
  phase2_attendance?: "present" | "absent" | "pending";
}

export interface Instructor {
  id: string;
  profile_id: string;
  full_name: string;
  bio: string;
  qualifications: string[];
  awards: string[];
  philosophy: string;
}

export interface Application {
  id: string;
  applicant_name: string;
  email: string;
  phone: string;
  state: string;
  experience_level: string;
  motivation: string;
  status: "pending" | "approved" | "rejected";
  reviewed_at?: string;
  created_at: string;
  course_id?: "real-estate-os" | "property-advisor-hcpa";
}

export interface Cohort {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  capacity: number;
  active: boolean;
  instructor_id: string; // references profile_id of instructor
}

export interface CohortMember {
  cohort_id: string;
  user_id: string;
  enrolled_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  module_number: number;
  objective: string;
  phase: 1 | 2;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  lesson_number: number;
}

export interface Assignment {
  id: string;
  module_id: string;
  title: string;
  description: string;
  points_possible: number;
}

export interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  content_text?: string;
  content_link?: string;
  content_file_name?: string;
  content_public_id?: string; // Cloudinary public_id for the uploaded file
  grade?: number;
  feedback?: string;
  status: "pending" | "graded" | "rejected";
  submitted_at: string;
}

export interface Quiz {
  id: string;
  module_id: string;
  title: string;
  passing_score: number; // e.g. 75
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  passed: boolean;
  attempted_at: string;
}

export interface Meeting {
  id: string;
  cohort_id: string;
  topic: string;
  meeting_url: string;
  scheduled_at: string;
}

export interface Attendance {
  id: string;
  meeting_id: string;
  user_id: string;
  present: boolean;
  marked_at: string;
}

export interface Announcement {
  id: string;
  cohort_id: string | null;
  title: string;
  content: string;
  created_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  certificate_code: string; // format: HS-LEVEL-ID
  issue_date: string;
  hash: string;
  level: number;
  level_name: string;
}

export interface GraduateStatus {
  id: string;
  user_id: string;
  deployment_status: "Active" | "Available" | "Assigned" | "Suspended" | "Alumni";
  placement_notes?: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  body: string;
  sent_at: string;
}

// ----------------------------------------------------
// SEED DATA DECLARATIONS
// ----------------------------------------------------

export const seedProfiles: Profile[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    full_name: "Housmata Super Admin",
    email: "admin@housmata.co",
    role: "admin",
    created_at: new Date().toISOString(),
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    full_name: "Akinwunmi Awoyode",
    email: "director@propertymax.co",
    role: "instructor",
    created_at: new Date().toISOString(),
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    full_name: "Adebayo Mensah",
    email: "adebayo@housmata.test",
    role: "student",
    created_at: new Date().toISOString(),
  },
];

export const seedInstructors: Instructor[] = [
  {
    id: "instructor-profile-uuid-1111",
    profile_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    full_name: "Akinwunmi Awoyode",
    bio: "Managing Director / CEO, Property Max Results Ltd. Real Estate Training Handbook Course Director. Focuses on tech-driven estate systems, digital listing standardisation, and structural asset operations.",
    qualifications: [
      "B.Sc. Physics and Mathematics (University of Ibadan)",
      "MSc Real Estate Management and Investment (Edinburgh Napier University, UK)",
      "MBA (University of South Wales, UK)",
      "Certified International Professional Manager (IPMA-UK)",
      "International Member, National Association of Realtors (USA)",
    ],
    awards: [
      "Recognised by The Guardian Nigeria as one of the Visionary CEOs shaping Nigeria's economic landscape (2024/2025)",
    ],
    philosophy:
      "Focus on integrity, structured documentation, technology-driven estate management, and wealth creation through real estate.",
  },
];

export const seedCourses: Course[] = [
  {
    id: "real-estate-os",
    title: "Housmata Certified Estate Manager",
    description: "Full Academic & Operational Curriculum Framework designed to produce competent estate managers specializing in rent collection and landlord-tenant operations.",
  },
  {
    id: "property-advisor-hcpa",
    title: "Housmata Certified Property Advisor",
    description: "Comprehensive professional certification designed to produce competent, ethical, and technology-enabled Property Advisors specializing in investment, verification, and sales advisory.",
  }
];

export const seedCourse = seedCourses[0];
export const seedCourse2 = seedCourses[1];

// 9 Modules of Phase 1
export const seedModules: Module[] = [
  {
    id: "p1-m1",
    course_id: seedCourse.id,
    title: "Introduction to Modern Real Estate Practice",
    module_number: 1,
    objective: "To ground trainees in real estate principles, distinguishing roles and understanding the ecosystem.",
    phase: 1,
  },
  {
    id: "p1-m2",
    course_id: seedCourse.id,
    title: "Ethics & Professional Conduct",
    module_number: 2,
    objective: "Understand trust as the currency of real estate, avoiding false listings, and enforcing financial integrity.",
    phase: 1,
  },
  {
    id: "p1-m3",
    course_id: seedCourse.id,
    title: "Tenant & Landlord Relationship Management",
    module_number: 3,
    objective: "Mastering conflict resolution frameworks, tenant retention, and managing owner expectations.",
    phase: 1,
  },
  {
    id: "p1-m4",
    course_id: seedCourse.id,
    title: "Property Inspection Systems",
    module_number: 4,
    objective: "Design inspection checklists and learn structural vs cosmetic risk flagging systems.",
    phase: 1,
  },
  {
    id: "p1-m5",
    course_id: seedCourse.id,
    title: "Property Media & Content Creation",
    module_number: 5,
    objective: "Creating professional smartphone photography and walkthrough video scripts to attract high-value leads.",
    phase: 1,
  },
  {
    id: "p1-m6",
    course_id: seedCourse.id,
    title: "Rent Collection & Financial Flow",
    module_number: 6,
    objective: "Understanding rent cycles, handling delinquency, receipting systems, and basic property accounting.",
    phase: 1,
  },
  {
    id: "p1-m7",
    course_id: seedCourse.id,
    title: "Property Documentation & Agreement Management",
    module_number: 7,
    objective: "Deep dive into legal tenancy agreements, inventory reports, and document lifecycle control.",
    phase: 1,
  },
  {
    id: "p1-m8",
    course_id: seedCourse.id,
    title: "Client Communication & Negotiation",
    module_number: 8,
    objective: "Psychology of real estate negotiation, handling common objections, and landlord communication strategies.",
    phase: 1,
  },
  {
    id: "p1-m9",
    course_id: seedCourse.id,
    title: "Introduction to Housmata Platform",
    module_number: 9,
    objective: "Account setup, navigation, listing structures, and data entry integrity standards on the platform.",
    phase: 1,
  },

  // 7 Days of Phase 2 Bootcamp
  {
    id: "p2-d1",
    course_id: seedCourse.id,
    title: "Day 1: Digital Listing Management System",
    module_number: 1,
    objective: "Understand verified listings vs noise, listing standardisation, and avoiding duplications.",
    phase: 2,
  },
  {
    id: "p2-d2",
    course_id: seedCourse.id,
    title: "Day 2: Tenant Onboarding System",
    module_number: 2,
    objective: "Control tenant entry into the ecosystem using digital KYC tools and behavioral scoring templates.",
    phase: 2,
  },
  {
    id: "p2-d3",
    course_id: seedCourse.id,
    title: "Day 3: Landlord Database Management",
    module_number: 3,
    objective: "Map multiple properties under single ownership and log communication trails to build owner trust.",
    phase: 2,
  },
  {
    id: "p2-d4",
    course_id: seedCourse.id,
    title: "Day 4: Rent Tracking & Payment Systems",
    module_number: 4,
    objective: "Reconciliation processes, rent tracking lifecycles, and default escalation procedures.",
    phase: 2,
  },
  {
    id: "p2-d5",
    course_id: seedCourse.id,
    title: "Day 5: Inspection & Maintenance Workflow",
    module_number: 5,
    objective: "Create maintenance logs, assign service vendors, and classify preventive vs reactive tickets.",
    phase: 2,
  },
  {
    id: "p2-d6",
    course_id: seedCourse.id,
    title: "Day 6: Digital Documentation System",
    module_number: 6,
    objective: "Automated agreement generation, digital vaults, version control, and audit logs.",
    phase: 2,
  },
  {
    id: "p2-d7",
    course_id: seedCourse.id,
    title: "Day 7: Capstone Integrated Simulation",
    module_number: 7,
    objective: "Operate the full digital property management workflow end-to-end under simulated pressure.",
    phase: 2,
  },
  
  // HCPA Modules
  { id: "hcpa-m0", course_id: "property-advisor-hcpa", title: "Orientation: Welcome to Housmata Academy", module_number: 0, objective: "Mindset of a trusted advisor, Housmata mission, and career paths.", phase: 1 },
  { id: "hcpa-m1", course_id: "property-advisor-hcpa", title: "The Nigerian Real Estate Industry", module_number: 1, objective: "Understanding the industry history, residential/commercial and wealth creation.", phase: 1 },
  { id: "hcpa-m2", course_id: "property-advisor-hcpa", title: "Professional Ethics & Building Trust", module_number: 2, objective: "Transparency, conflicts of interest, and the Housmata Code of Ethics.", phase: 1 },
  { id: "hcpa-m3", course_id: "property-advisor-hcpa", title: "Understanding Land Banking", module_number: 3, objective: "Land banking mechanics, growth corridors, and risk analysis.", phase: 1 },
  { id: "hcpa-m4", course_id: "property-advisor-hcpa", title: "Understanding Property Documents", module_number: 4, objective: "Titles, Deeds, Certificates of Occupancy, and search reports.", phase: 1 },
  { id: "hcpa-m5", course_id: "property-advisor-hcpa", title: "Property Verification", module_number: 5, objective: "Executing ownership, title, GPS coordinate, and developer checks.", phase: 1 },
  { id: "hcpa-m6", course_id: "property-advisor-hcpa", title: "Property Brokerage & Sales", module_number: 6, objective: "Buyer/seller representation, client prospecting, and negotiation closing.", phase: 1 },
  { id: "hcpa-m7", course_id: "property-advisor-hcpa", title: "Digital Marketing for Property Professionals", module_number: 7, objective: "Premium visual media, social channels, and lead generation funnels.", phase: 1 },
  { id: "hcpa-m8", course_id: "property-advisor-hcpa", title: "The Housmata Technology Platform", module_number: 8, objective: "Masters list uploads, coordinates checks, and lead CRM dashboards.", phase: 1 },
  { id: "hcpa-m9", course_id: "property-advisor-hcpa", title: "Understanding Property Finance", module_number: 9, objective: "Cash, installments, developer financing, and cooperative finance.", phase: 1 },
  { id: "hcpa-m10", course_id: "property-advisor-hcpa", title: "Mortgage Readiness", module_number: 10, objective: "Client mortgage readiness check and referral pipeline to partners.", phase: 1 },
  { id: "hcpa-m11", course_id: "property-advisor-hcpa", title: "Site Inspection Excellence", module_number: 11, objective: "Inspection preparation, tour presentation, and on-site objection handling.", phase: 1 },
  { id: "hcpa-m12", course_id: "property-advisor-hcpa", title: "Negotiation & Closing", module_number: 12, objective: "Negotiating counter-offers, payment plans, and handover checklists.", phase: 1 },
  { id: "hcpa-m13", course_id: "property-advisor-hcpa", title: "Building Your Personal Brand", module_number: 13, objective: "LinkedIn, WhatsApp, regional speaking, and personal brand authority.", phase: 1 },
  { id: "hcpa-m14", course_id: "property-advisor-hcpa", title: "Running Your Property Business", module_number: 14, objective: "Inflow pipeline, tax structures, CRMs, KPIs, and team building.", phase: 1 },
  { id: "hcpa-m15", course_id: "property-advisor-hcpa", title: "Becoming a Housmata Certified Property Advisor", module_number: 15, objective: "Panel review, ethics exam, Capstone project portfolio, and deployment.", phase: 1 }
];

export const seedLessons: Lesson[] = [
  // Module 1 Lessons
  {
    id: "p1-m1-l1",
    module_id: "p1-m1",
    title: "Real Estate Definition & Boundaries",
    content: "Real estate is more than buying and selling land. It represents a physical asset bound by legal structures, community interests, and financial capabilities. To operate within Housmata, you must understand that every property has a lifecycle: landlord onboarding, content creation, listing publication, tenant KYC vetting, agreement sign-off, collection cycles, maintenance workflows, and move-out audits.",
    lesson_number: 1,
  },
  {
    id: "p1-m1-l2",
    module_id: "p1-m1",
    title: "Roles (Estate Managers vs Agents vs Brokers)",
    content: "Traditional agents act purely as transactional matchmakers. Brokers manage legal transactions. **Digital Estate Managers**, however, operate the assets over time. Inside Housmata, you are trained to protect asset value, verify listing data integrity, and manage relationships systematically rather than walking away after signing a lease.",
    lesson_number: 2,
  },
  {
    id: "p1-m1-l3",
    module_id: "p1-m1",
    title: "The Nigerian Real Estate Ecosystem",
    content: "The Nigerian landscape is highly fragmented with low trust. False listings represent over 60% of online property databases. Landlords frequently experience broken promises, untracked payments, and deteriorating structures. Housmata aims to replace this chaos with system-dependent operators using digital infrastructure.",
    lesson_number: 3,
  },
  {
    id: "p1-m1-l4",
    module_id: "p1-m1",
    title: "Introduction to Digital Property Management",
    content: "Digital property management means transitioning from paper spreadsheets and memory to centralized databases. All operations—from inspection photos to landlord payment reconciliations—are tracked digitally, establishing an audit trail that builds investor-ready confidence.",
    lesson_number: 4,
  },

  // Module 2 Lessons (Ethics)
  {
    id: "p1-m2-l1",
    module_id: "p1-m2",
    title: "Ethics as an Operating System",
    content: "Ethics in real estate is not a set of moral suggestions; it is a professional operating system that protects transactions. The core principle is: **'In real estate, trust is more valuable than commission.'** A single misrepresentation can destroy landlord trust, compromise tenant safety, and ruin an operator's career.",
    lesson_number: 1,
  },
  {
    id: "p1-m2-l2",
    module_id: "p1-m2",
    title: "Common Unethical Practices to Avoid",
    content: "You must never engage in:\n1. **False Listings**: Advertising properties that do not exist or are already rented.\n2. **Price Manipulation**: secretly inflating rents or charging double client fees.\n3. **Information Withholding**: concealing structural defects like water leaks or active zoning disputes.\n4. **Verbal-Only Agreements**: operating without a clear paper trail, creating 'he said/she said' blockages.",
    lesson_number: 2,
  },
  {
    id: "p1-m2-l3",
    module_id: "p1-m2",
    title: "Transparency in Listings & Photos",
    content: "Housmata standards require every listing to use real, current photos. Stock images, photos from other buildings, or photos hiding active damage are forbidden. A property that is hard to explain honestly is simply not ready to be listed.",
    lesson_number: 3,
  },
  {
    id: "p1-m2-l4",
    module_id: "p1-m2",
    title: "Client Funds & Financial Ethics",
    content: "Rule 1: **Never mix personal and client funds.** All tenancy payments, caution deposits, and service charges must flow through designated collection paths with digital receipts generated immediately. Real estate operators are custodians of capital, not owners.",
    lesson_number: 4,
  },

  // Module 7 Lessons (Documentation & Agreements)
  {
    id: "p1-m7-l1",
    module_id: "p1-m7",
    title: "Why Documentation is the Foundation of Real Estate",
    content: "Real estate is not enforced by memory; it is enforced by written contracts, records, and traceable commitments. Without proper documentation, any transaction becomes a source of dispute, leading to legal exposure and financial leakage.",
    lesson_number: 1,
  },
  {
    id: "p1-m7-l2",
    module_id: "p1-m7",
    title: "Types of Essential Property Documents",
    content: "Every property in your portfolio must maintain:\n1. **Tenancy Agreement**: defining rent terms, duration, and responsibilities.\n2. **Property Inventory Report**: listing fixtures, fittings, and their condition at entry.\n3. **Inspection Reports**: documenting structural integrity and risk flag alerts.\n4. **Receipts & Payment History**: tracking income and arrears.\n5. **Communication Logs**: archiving formal notices and agreements.",
    lesson_number: 2,
  },
  {
    id: "p1-m7-l3",
    module_id: "p1-m7",
    title: "Tenancy Agreement Structure (Non-Legal Drafting)",
    content: "While you are not drafting as a lawyer, you must understand the core clauses of a tenancy contract:\n- Correct names of parties (landlord and tenant).\n- Clear description of the demised premises.\n- Exact rent amount, frequency, and payment deadline.\n- Maintenance obligations (external repairs vs tenant utility issues).\n- Notice periods and termination triggers.",
    lesson_number: 3,
  },
  {
    id: "p1-m7-l4",
    module_id: "p1-m7",
    title: "Inventory & Condition Report System",
    content: "The inventory report exists to prevent exit-stage disputes. Before keys are handed over, walk through the property and document walls, doors, windows, locks, plumbing, and electrical outlets. If a fixture exists, its exact condition must exist in the inventory sheet.",
    lesson_number: 4,
  },

  // Day 1 (Phase 2 Bootcamp)
  {
    id: "p2-d1-l1",
    module_id: "p2-d1",
    title: "Data as the Foundation of Property Control",
    content: "On Day 1 of the Bootcamp, we focus on property data integrity. You will learn to construct verified listings in a standard format: Location, Specs, Pricing, and Status. You must audit listing details to eliminate duplicate listings, inspect files for fake descriptions, and validate pricing structures before marketing.",
    lesson_number: 1,
  },

  // Day 2 (Phase 2 Bootcamp)
  {
    id: "p2-d2-l1",
    module_id: "p2-d2",
    title: "Controlling Who Enters Your Estate Ecosystem",
    content: "Day 2 focuses on tenant onboarding workflows. You will perform digital KYC (Know Your Customer) verifications, review proof of income, log identity cards, and evaluate tenant behavioral risk scoring using the Housmata onboarding checklist.",
    lesson_number: 1,
  },

  // Day 3 (Phase 2 Bootcamp)
  {
    id: "p2-d3-l1",
    module_id: "p2-d3",
    title: "Every Property Must Have an Accountable Owner System",
    content: "Day 3 teaches relationship mapping. You will build a database representing landlords, link multiple properties under single ownership profiles, and record client communication logs (e.g. maintenance approvals, payment requests) to ensure complete transparency.",
    lesson_number: 1,
  },

  // Day 4 (Phase 2 Bootcamp)
  {
    id: "p2-d4-l1",
    module_id: "p2-d4",
    title: "Money Flow is the Heartbeat of Estate Management",
    content: "Day 4 covers rent lifecycles, monitoring incoming transactions, flagging defaults, logging reconciliations, and executing fallback payment warnings if a tenant misses the rent window.",
    lesson_number: 1,
  },

  // Day 5 (Phase 2 Bootcamp)
  {
    id: "p2-d5-l1",
    module_id: "p2-d5",
    title: "Protecting Asset Value Through Structured Response",
    content: "Day 5 centers on maintenance tickets. You will log work requests, assign verified local vendors, track response times, and tag issues as either 'preventive maintenance' (like annual roof checks) or 'reactive maintenance' (like a burst pipe).",
    lesson_number: 1,
  },

  // Day 6 (Phase 2 Bootcamp)
  {
    id: "p2-d6-l1",
    module_id: "p2-d6",
    title: "If It's Not Documented, It Doesn't Exist",
    content: "Day 6 focuses on document auto-generation. You will assemble tenancy agreements, verify inventory lists, organize files in the digital folder structure, and audit versions to protect landlord and tenant relationships.",
    lesson_number: 1,
  },

  // Day 7 (Phase 2 Bootcamp)
  {
    id: "p2-d7-l1",
    module_id: "p2-d7",
    title: "Operating the Full Estate System Under Pressure",
    content: "Day 7 is the Capstone simulation. You will connect all modules into a single, cohesive workflow: Source a property -> upload listing -> onboard a tenant (KYC) -> map landlord portfolio -> track mock payments -> log a maintenance issue -> auto-generate a compliance case file.",
    lesson_number: 1,
  },
];

export const seedQuizzes: Quiz[] = [
  ...generatedQuizzes,
  {
    id: "quiz-p1-m2",
    module_id: "p1-m2",
    title: "Module 2: Ethics & Conduct Assessment",
    passing_score: 75,
  },
  {
    id: "quiz-p1-m7",
    module_id: "p1-m7",
    title: "Module 7: Documentation Standard Quiz",
    passing_score: 75,
  },
  {
    id: "quiz-p2-d7",
    module_id: "p2-d7",
    title: "Phase 2: Final Capstone Competency Quiz",
    passing_score: 75,
  },
];

export const seedQuizQuestions: QuizQuestion[] = [
  ...generatedQuizQuestions,
  ...generatedQuizQuestions2,
  // Module 2 Ethics Quiz Questions
  {
    id: "q-p1m2-1",
    quiz_id: "quiz-p1-m2",
    question: "What is considered the 'currency of real estate' in the Housmata training program?",
    options: ["Commissions", "Property Listings", "Trust", "Advertisements"],
    correct_option_index: 2,
  },
  {
    id: "q-p1m2-2",
    quiz_id: "quiz-p1-m2",
    question: "If a landlord wants to list a property with water leakage as 'fully renovated', what is the ethical course of action?",
    options: [
      "List it as requested to secure the deal.",
      "List it but avoid taking pictures of the leakage.",
      "Refuse the false description, explain the transparency policy, and document the true condition.",
      "Tell the tenant verbally after they pay the commitment fee.",
    ],
    correct_option_index: 2,
  },
  {
    id: "q-p1m2-3",
    quiz_id: "quiz-p1-m2",
    question: "Which of the following is NOT an ethical rule for handling client funds?",
    options: [
      "Always generate a digital receipt for payments.",
      "Co-mingle personal emergency funds with client caution deposits temporarily.",
      "Maintain a clear, traceable transaction record.",
      "Treat client funds as a custodian, not the owner.",
    ],
    correct_option_index: 1,
  },
  {
    id: "q-p1m2-4",
    quiz_id: "quiz-p1-m2",
    question: "How does the Housmata platform enforce professional ethics?",
    options: [
      "By asking agents to take weekly oaths.",
      "Through structured systems, digital audit trails, and data standardisation.",
      "By charging high listing fees.",
      "Through manual policing and phone call warnings.",
    ],
    correct_option_index: 1,
  },

  // Module 7 Documentation Quiz Questions
  {
    id: "q-p1m7-1",
    quiz_id: "quiz-p1-m7",
    question: "What is the primary role of inventory reports in property management?",
    options: [
      "To increase the property value.",
      "To document fixtures and condition at entry, preventing disputes at exit stage.",
      "To calculate the landlord's tax liability.",
      "To advertise properties online.",
    ],
    correct_option_index: 1,
  },
  {
    id: "q-p1m7-2",
    quiz_id: "quiz-p1-m7",
    question: "What is the golden rule of property documentation?",
    options: [
      "Keep it long and complex so it looks legal.",
      "If it exists in the property, it must exist in the document.",
      "Write it on paper and don't make copies.",
      "Only create agreements when issues arise.",
    ],
    correct_option_index: 1,
  },
  {
    id: "q-p1m7-3",
    quiz_id: "quiz-p1-m7",
    question: "Which of these is the correct order of the documentation lifecycle in Housmata?",
    options: [
      "Storage -> Creation -> Updates -> Verification",
      "Creation -> Verification -> Storage -> Updates -> Archiving",
      "Verification -> Archiving -> Storage -> Creation",
      "Creation -> Archiving -> Storage -> Updates",
    ],
    correct_option_index: 1,
  },

  // Capstone Quiz
  {
    id: "q-p2d7-1",
    quiz_id: "quiz-p2-d7",
    question: "A digital estate operator is considered competent under the Housmata standard when they can:",
    options: [
      "Successfully sell 10 lands in one month.",
      "Operate a full digital property workflow, maintain tenant/landlord data, track rents, and handle maintenance without supervision.",
      "Draft standard legal court proceedings for tenant evictions.",
      "Manually manage multiple spreadsheets using memory.",
    ],
    correct_option_index: 1,
  },
];

export const seedAssignments: Assignment[] = [
  {
    id: "assign-p1-m2",
    module_id: "p1-m2",
    title: "Ethics and Transparency Case Study",
    description: "Scenario: A landlord insists on listing an apartment with known plumbing deficiencies as 'perfectly functional' to maintain a higher rent price. Draft a step-by-step resolution plan detailing how you will communicate, draft the listing, and document the agreement in line with Housmata ethical guidelines.",
    points_possible: 100,
  },
  {
    id: "assign-p1-m3",
    module_id: "p1-m3",
    title: "Tenant Onboarding Assessment",
    description: "Submit a presentation outlining a comprehensive tenant onboarding process, emphasizing how proper onboarding reduces future friction.",
    points_possible: 100,
  },
  {
    id: "assign-p1-m4",
    module_id: "p1-m4",
    title: "Property Inspection Report",
    description: "Upload a sample property inspection report highlighting potential structural and cosmetic issues for a 2-bedroom apartment.",
    points_possible: 100,
  },
  {
    id: "assign-p1-m5",
    module_id: "p1-m5",
    title: "Content Creation Portfolio",
    description: "Provide a mock portfolio containing at least three property photos and a video walkthrough script designed to attract high-value leads.",
    points_possible: 100,
  },
  {
    id: "assign-p1-m6",
    module_id: "p1-m6",
    title: "Financial Flow Case Study",
    description: "Present a case study on resolving a delinquent rent situation while maintaining professional relationships and proper documentation.",
    points_possible: 100,
  },
  {
    id: "assign-p1-m7",
    module_id: "p1-m7",
    title: "Documentation Strategy",
    description: "Submit a pdf outlining the lifecycle of property documents from the initial lease agreement to final exit inventory logs.",
    points_possible: 100,
  },
  {
    id: "assign-p1-m8",
    module_id: "p1-m8",
    title: "Negotiation Tactics Simulation",
    description: "Write a brief script simulating a negotiation between a landlord wanting to raise rent and a tenant disputing the hike.",
    points_possible: 100,
  },
  {
    id: "assign-p1-m9",
    module_id: "p1-m9",
    title: "Platform Setup Assignment",
    description: "Submit a slide deck walking through the initial setup of an account on the Housmata platform, demonstrating your understanding of its tools.",
    points_possible: 100,
  },
  {
    id: "assign-p2-d1",
    module_id: "p2-d1",
    title: "Create 3 Standard Verified Property Listings",
    description: "Submit 3 property listings structured with: location, exact specs, validated pricing, and current status. Identify and write corrections for 1 flawed listing example containing exaggerated terms.",
    points_possible: 100,
  },
  {
    id: "assign-p2-d2",
    module_id: "p2-d2",
    title: "Simulate Onboarding for 2 Tenant Profiles",
    description: "Perform KYC checks and compute behavioral risk scores for two student profiles: one showing low-risk credentials and another highlighting high-risk factors (e.g. undocumented references, inconsistent income). Provide onboarding recommendations for both.",
    points_possible: 100,
  },

  // HCPA Assignments (Modules 2-16: hcpa-m1 through hcpa-m15)
  { id: "assign-hcpa-m1", module_id: "hcpa-m1", title: "Growth Corridor Research", description: "Research three fast-growing locations in your state and explain why they are attractive for property investment.", points_possible: 100 },
  { id: "assign-hcpa-m2", module_id: "hcpa-m2", title: "Ethics Sign-off & Case Analysis", description: "Analyze a case where a buyer lost money due to an unethical broker, identify the warning signs, and sign the Housmata Professional Code.", points_possible: 100 },
  { id: "assign-hcpa-m3", module_id: "hcpa-m3", title: "Land Banking Sourcing", description: "Identify one future land banking location in your region, analyze its growth drivers, and outline its potential risks.", points_possible: 100 },
  { id: "assign-hcpa-m4", module_id: "hcpa-m4", title: "Document Inspection Review", description: "Inspect three sample property documents (Survey Plan, C of O, and Deed of Assignment) and point out key elements like coordinates, signatures, and stamps.", points_possible: 100 },
  { id: "assign-hcpa-m5", module_id: "hcpa-m5", title: "Verification Checklist Execution", description: "Complete a full Housmata Property Verification Checklist for a mock property based on coordinates, developer records, and site photos.", points_possible: 100 },
  { id: "assign-hcpa-m6", module_id: "hcpa-m6", title: "Sales Presentation Simulation", description: "Draft a sales pitch for a target property using the Housmata process, addressing client objections regarding price and location.", points_possible: 100 },
  { id: "assign-hcpa-m7", module_id: "hcpa-m7", title: "Listing Campaign Design", description: "Design a comprehensive digital campaign plan for a property listing, including copywriting, walkthrough scripts, and ad targeting.", points_possible: 100 },
  { id: "assign-hcpa-m8", module_id: "hcpa-m8", title: "Demo Platform Listing Upload", description: "Log in to the Housmata simulator, upload a verified property listing with documents, coordinates, and images, and log a mock enquiry.", points_possible: 100 },
  { id: "assign-hcpa-m9", module_id: "hcpa-m9", title: "Payment Plan Comparison", description: "Compare cash, installment, and developer financing options for a 20 Million Naira property and write a recommendations report.", points_possible: 100 },
  { id: "assign-hcpa-m10", module_id: "hcpa-m10", title: "Mortgage Readiness Assessment", description: "Complete a mortgage readiness assessment file for a mock client earning a set salary, showing equity availability and debt-to-income calculations.", points_possible: 100 },
  { id: "assign-hcpa-m11", module_id: "hcpa-m11", title: "Mock Inspection Recording", description: "Prepare an inspection script for a client tour, outlining your storytelling flow and how you would address a major objection on site.", points_possible: 100 },
  { id: "assign-hcpa-m12", module_id: "hcpa-m12", title: "Closing File Compilation", description: "Compile a transaction file including offer letters, reservation documents, payment plans, and handover schedules for approval.", points_possible: 100 },
  { id: "assign-hcpa-m13", module_id: "hcpa-m13", title: "Personal Brand Strategy", description: "Write a positioning statement and draft a month of educational social media post titles demonstrating property advisory expertise.", points_possible: 100 },
  { id: "assign-hcpa-m14", module_id: "hcpa-m14", title: "Business Budget & KPI Setup", description: "Set up a basic operational budget, define quarterly sales KPIs, and outline your CRM record-keeping workflow.", points_possible: 100 },
  { id: "assign-hcpa-m15", module_id: "hcpa-m15", title: "Final Review Verification Portfolio", description: "Submit your comprehensive Capstone checklist and double-check your overall compliance before the final certification panel review.", points_possible: 100 }
];

export const seedCohorts: Cohort[] = [
  {
    id: "cohort-alpha",
    name: "Cohort Alpha (Digital Property Operators)",
    start_date: "2026-06-01",
    end_date: "2026-08-31",
    capacity: 25,
    active: true,
    instructor_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  },
  {
    id: "cohort-beta",
    name: "Cohort Beta (Digital Property Operators)",
    start_date: "2026-09-01",
    end_date: "2026-11-30",
    capacity: 30,
    active: true,
    instructor_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  },
];

export const seedCohortMembers: CohortMember[] = [
  {
    cohort_id: "cohort-alpha",
    user_id: "student-uuid-1111-2222-333333333333", // Adebayo Mensah
    enrolled_at: "2026-05-01",
  },
];
