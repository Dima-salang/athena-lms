export interface SpecialAccessRecord {
  id: string;
  studentId: string;
  studentName: string;
  username: string;
  lrn?: string;
  sectionName?: string;
  customDueDate?: string;
  extendedSeconds?: number | null;
  isUnlocked: boolean;
}

export interface CandidateStudent {
  id: string;
  name: string;
  username: string;
  lrn: string;
  sectionName: string;
}

export interface OverrideInput {
  studentId: string;
  customDueDate: string;
  extensionMinutes: number;
  isUnlocked: boolean;
}
