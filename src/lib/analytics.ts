import { db } from "./db";
import { Profile } from "./mockData";
import { phase1Curriculum, hcpaCurriculum } from "./curriculum";

export type AtRiskFlag =
  | "stalled-phase"
  | "low-average-grade"
  | "failed-quiz"
  | "penalized-attempts"
  | "no-submissions"
  | "behind-cohort";

export type AtRiskStudent = {
  id: string;
  name: string;
  email: string;
  phase: number;
  avgGrade: number | null;
  completedModules: number;
  flags: AtRiskFlag[];
  score: number; // higher = more at risk
};

const LOW_GRADE_THRESHOLD = 60; // below this avg is concerning
const PENALTY_ATTEMPTS = 2; // 2+ attempts implies repeated failure

/**
 * Heuristic at-risk detection computed purely from existing db state.
 * Returns students sorted by risk score (most at risk first).
 * Optionally scoped to a single cohort.
 */
export function getAtRiskStudents(cohortId?: string): AtRiskStudent[] {
  const students = db
    .getProfiles()
    .filter((p: Profile) => p.role === "student");

  const scoped = cohortId
    ? students.filter((s) => {
        const cohort = db.getStudentCohort(s.id);
        return cohort?.id === cohortId;
      })
    : students;

  const results: AtRiskStudent[] = [];

  for (const student of scoped) {
    const progress = db.getProgress(student.id);
    const flags: AtRiskFlag[] = [];

    // Average grade across graded modules
    const activeCurriculum =
      progress.course_id === "property-advisor-hcpa"
        ? hcpaCurriculum
        : phase1Curriculum;

    let total = 0;
    let count = 0;
    for (const mod of activeCurriculum) {
      const g = db.getFinalModuleGrade(student.id, mod.id);
      if (g && g.finalGrade > 0) {
        total += g.finalGrade;
        count++;
      }
    }
    const avgGrade = count > 0 ? Math.round(total / count) : null;

    if (avgGrade !== null && avgGrade < LOW_GRADE_THRESHOLD) {
      flags.push("low-average-grade");
    }

    // Quiz attempts: failed or heavily penalized
    const attempts = db.getQuizAttempts(student.id);
    const failed = attempts.filter((a) => !a.passed).length;
    const manyAttempts = attempts.filter((a) => {
      // count attempts beyond the first per quiz (penalty implies repeated failure)
      const sameQuiz = attempts.filter((x) => x.quiz_id === a.quiz_id);
      return sameQuiz.indexOf(a) >= PENALTY_ATTEMPTS;
    }).length;

    if (failed > 0) flags.push("failed-quiz");
    if (manyAttempts > 0) flags.push("penalized-attempts");

    // Submissions: enrolled but nothing submitted
    const submissions = db.getStudentSubmissions(student.id);
    if (submissions.length === 0 && progress.completed_modules.length === 0) {
      flags.push("no-submissions");
    }

    // Stalled: Phase 1 but has been around (no completed modules despite being active)
    if (progress.current_phase === 1 && progress.completed_modules.length === 0) {
      flags.push("stalled-phase");
    }

    if (flags.length === 0) continue;

    // Risk score: weight flags
    let score = 0;
    if (flags.includes("stalled-phase")) score += 3;
    if (flags.includes("no-submissions")) score += 2;
    if (flags.includes("failed-quiz")) score += 2;
    if (flags.includes("low-average-grade")) score += 3;
    if (flags.includes("penalized-attempts")) score += 2;
    if (flags.includes("behind-cohort")) score += 1;

    results.push({
      id: student.id,
      name: student.full_name,
      email: student.email,
      phase: progress.current_phase,
      avgGrade,
      completedModules: progress.completed_modules.length,
      flags,
      score,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
