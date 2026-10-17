export interface TeacherTestItem {
  id: string;
  title: string;
  examType: string;
  subjectName?: string | null;
  sectionNames: string[];
  durationSeconds?: number | null;
  hasInfiniteTime: boolean;
  dueDate?: string | null;
  isPublished: boolean;
  isDraft: boolean;
  questionCount: number;
  submissionCount: number;
  updatedAt: string;
}

export type TestStatusFilter = "ALL" | "PUBLISHED" | "DRAFT";

export type TestSortKey = "recent" | "deadline" | "title";
