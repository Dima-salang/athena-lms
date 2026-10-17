import type { AdminUserItem } from "@/components/admin/users/types";

/** A row in the sections list. */
export interface SectionItem {
  id: string;
  name: string;
  adviserName: string | null;
  gradeLevel: string | null;
  schoolYear: string | null;
  isActive: boolean;
  studentCount: number;
}

/** One teacher-and-subject pairing inside a section. */
export interface SectionAssignmentRow {
  id: string;
  teacherProfileId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  schoolYear: string | null;
}

/** Everything the section page needs. */
export interface SectionDetail extends SectionItem {
  students: AdminUserItem[];
  assignments: SectionAssignmentRow[];
}

export interface SectionFormValues {
  name: string;
  adviserName: string;
  gradeLevel: string;
  schoolYear: string;
}

export const DEFAULT_SCHOOL_YEAR = "2026-2027";

export const EMPTY_SECTION_FORM: SectionFormValues = {
  name: "",
  adviserName: "",
  gradeLevel: "",
  schoolYear: DEFAULT_SCHOOL_YEAR,
};

export function sectionSubtitle(section: {
  gradeLevel: string | null;
  adviserName: string | null;
  schoolYear: string | null;
}): string {
  const parts = [
    section.gradeLevel || null,
    section.adviserName ? `Adviser: ${section.adviserName}` : "No adviser yet",
    section.schoolYear || null,
  ].filter(Boolean);
  return parts.join(" • ");
}
