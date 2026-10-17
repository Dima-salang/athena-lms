export interface SubmissionItem {
  id: string;
  testId: string;
  testTitle: string;
  studentId: string;
  studentName: string;
  studentLrn: string;
  sectionName: string;
  status: string;
  startTime: string;
  endTime?: string;
  submittedAt?: string;
  gradedAt?: string;
  rawScore?: number | null;
  transmutedGrade?: number | null;
  totalPoints: number;
}

export type SubmissionStatusFilter =
  | "ALL"
  | "SUBMITTED"
  | "GRADED"
  | "IN_PROGRESS";

export type SubmissionSortKey = "recent" | "score" | "name";
