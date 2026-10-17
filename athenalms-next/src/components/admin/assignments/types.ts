import type { OptionItem } from "@/components/admin/types";

export type { OptionItem };

/** One teacher assigned to a subject in a section. */
export interface AssignmentItem {
  id: string;
  teacherProfileId: string;
  teacherName: string;
  teacherUsername: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string | null;
  schoolYear: string | null;
}

/** A teacher, keyed by the profile id the API expects. */
export interface TeacherOption {
  id: string;
  name: string;
  username: string;
}

export interface AssignmentFormValues {
  teacherProfileId: string;
  sectionId: string;
  subjectId: string;
  schoolYear: string;
}

export type AssignmentSort = "teacher" | "section" | "subject";

export const ASSIGNMENT_SORT_LABELS: Record<AssignmentSort, string> = {
  teacher: "Teacher (A–Z)",
  section: "Section (A–Z)",
  subject: "Subject (A–Z)",
};
