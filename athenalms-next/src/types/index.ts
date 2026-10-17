/**
 * Shared TypeScript types and DTOs
 *
 * These types define the complete public contract across the application:
 * - Domain entities & DTOs
 * - API request payloads & responses
 * - Component props & view models
 * - Academic structure & psychometrics
 *
 * Fully decoupled from Prisma to guarantee type safety and architectural boundary integrity.
 */

// ─────────────────────────────────────────────────────────────────────────────
// User & Authentication Contracts
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface StudentProfileDTO {
  lrn: string;
  sectionId?: string | null;
  sectionName?: string | null;
}

export interface UserDTO {
  id: string;
  username: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string; // ISO string
  studentProfile?: StudentProfileDTO | null;
  teacherProfileId?: string | null;
}

export interface SessionUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  mustChangePassword: boolean;
  email?: string | null;
  studentProfile?: StudentProfileDTO | null;
  teacherProfileId?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Academic Structure
// ─────────────────────────────────────────────────────────────────────────────

export interface SectionDTO {
  id: string;
  name: string;
  adviserName?: string | null;
  gradeLevel?: string | null;
  schoolYear?: string | null;
  isActive: boolean;
  studentCount?: number;
}

export interface SubjectDTO {
  id: string;
  name: string;
  description?: string | null;
  code?: string | null;
  isActive: boolean;
}

export interface TeacherAssignmentDTO {
  id: string;
  teacherProfileId: string;
  teacherName: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  schoolYear?: string | null;
}

export interface TeacherSelectOption {
  id: string;
  name: string;
  username: string;
  teacherProfileId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Examinations & Questions
// ─────────────────────────────────────────────────────────────────────────────

export type ExamType = "QUIZ" | "LONG_TEST" | "SUMMATIVE" | "PERIODICAL";

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "IDENTIFICATION"
  | "ACRONYM"
  | "MATCHING"
  | "ESSAY";

export type TransmutationFormula = "DEPED_STANDARD" | "LINEAR_50_BASE" | "CUSTOM";

export interface OptionDTO {
  id: string;
  optionText: string;
  matchText?: string | null;
  orderIndex: number;
}

export interface QuestionDTO {
  id?: string;
  testId?: string;
  questionNumber: number;
  questionText: string;
  questionType: QuestionType;
  fullPoints: number;
  correctAnswer?: string | null;
  alternativeAnswers?: string | null;
  correctOptionId?: string | null;
  rubric?: string | null;
  imageUrl?: string | null;
  orderIndex: number;
  options: OptionDTO[];
}

export interface TransmutationConfigDTO {
  id?: string;
  testId?: string;
  formula: TransmutationFormula;
  baseScore?: number | null;
  passingRawPercent?: number | null;
  passingGrade?: number | null;
}

export interface TestSectionDTO {
  testId: string;
  sectionId: string;
  section: {
    id: string;
    name: string;
  };
}

export interface TestDTO {
  id: string;
  title: string;
  description?: string | null;
  examType: ExamType;
  authorId: string;
  authorName?: string;
  subjectId?: string | null;
  subjectName?: string | null;
  subjectCode?: string | null;
  sectionIds: string[];
  sectionNames?: string[];
  sections?: TestSectionDTO[];
  durationSeconds?: number | null;
  hasInfiniteTime: boolean;
  issueDate?: string | null;
  dueDate?: string | null;
  isPublished: boolean;
  isDraft?: boolean;
  isArchived: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  maxScore?: number | null;
  questionCount?: number;
  questions?: QuestionDTO[];
  transmutationConfig?: TransmutationConfigDTO | null;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Submissions & Student Progress
// ─────────────────────────────────────────────────────────────────────────────

export type SubmissionStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "TIMED_OUT"
  | "GRADED";

export interface StudentAnswerDTO {
  id?: string;
  submissionId?: string;
  questionId: string;
  optionId?: string | null;
  textAnswer?: string | null;
  matchingPairs?: string | null;
  points?: number | null;
  teacherComment?: string | null;
  isFlagged?: boolean;
  option?: OptionDTO | null;
}

export interface SubmissionDTO {
  id: string;
  testId: string;
  testTitle: string;
  studentId: string;
  studentName: string;
  studentLrn: string;
  sectionName: string;
  status: SubmissionStatus;
  startTime: string;
  endTime?: string | null;
  submittedAt?: string | null;
  gradedAt?: string | null;
  rawScore?: number | null;
  transmutedGrade?: number | null;
  totalPoints: number;
  clientIp?: string | null;
  teacherNotes?: string | null;
  studentAnswers?: StudentAnswerDTO[];
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    studentProfile?: StudentProfileDTO | null;
  };
  test?: {
    id: string;
    title: string;
    examType: ExamType;
    maxScore?: number | null;
    subject?: { name: string; code?: string | null } | null;
    questions?: QuestionDTO[];
    transmutationConfig?: TransmutationConfigDTO | null;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Student Dashboard & Exam Room Contracts
// ─────────────────────────────────────────────────────────────────────────────

export interface StudentTestItemDTO {
  id: string;
  title: string;
  description?: string | null;
  examType: ExamType;
  subjectName?: string | null;
  subjectCode?: string | null;
  durationSeconds?: number | null;
  hasInfiniteTime: boolean;
  issueDate?: string | null;
  dueDate?: string | null;
  createdAt?: string | null;
  questionCount: number;
  submission?: {
    id: string;
    status: SubmissionStatus;
    rawScore?: number | null;
    transmutedGrade?: number | null;
    submittedAt?: string | null;
    endTime?: string | null;
  } | null;
}

export interface StudentTestsResponseDTO {
  available: StudentTestItemDTO[];
  upcoming: StudentTestItemDTO[];
  completed: StudentTestItemDTO[];
}

export interface StudentActiveQuestionDTO {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: QuestionType;
  fullPoints: number;
  imageUrl?: string | null;
  orderIndex: number;
  options: OptionDTO[];
}

export interface StudentActiveTestDTO {
  id: string;
  title: string;
  description?: string | null;
  examType: ExamType;
  subjectName?: string | null;
  durationSeconds?: number | null;
  hasInfiniteTime: boolean;
  dueDate?: string | null;
  questions: StudentActiveQuestionDTO[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Special Access Overrides
// ─────────────────────────────────────────────────────────────────────────────

export interface SpecialAccessDTO {
  id: string;
  studentId: string;
  studentName: string;
  username: string;
  lrn?: string;
  sectionName?: string;
  customDueDate?: string | null;
  extendedSeconds?: number | null;
  isUnlocked: boolean;
}

export interface CandidateStudentDTO {
  id: string;
  name: string;
  username: string;
  lrn: string;
  sectionName: string;
}

export interface SpecialAccessResponseDTO {
  overrides: SpecialAccessDTO[];
  candidates: CandidateStudentDTO[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Psychometrics & Analytics
// ─────────────────────────────────────────────────────────────────────────────

export interface GradebookEntryDTO {
  studentId: string;
  studentName: string;
  lrn: string;
  sectionName: string;
  submissionId: string;
  status: SubmissionStatus;
  rawScore: number | null;
  totalPoints: number;
  rawPercent: number;
  transmutedGrade: number | null;
  submittedAt?: string | null;
}

export interface ItemAnalysisEntryDTO {
  questionId: string;
  questionNumber: number;
  questionText: string;
  questionType: QuestionType;
  fullPoints: number;
  difficultyIndex: number;
  difficultyCategory: "EASY" | "MODERATE" | "DIFFICULT";
  discriminationIndex: number;
  discriminationCategory: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  correctCount: number;
  wrongCount: number;
  totalResponses: number;
  percentCorrect: number;
}

export interface ScoreDistributionItemDTO {
  label: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummaryDTO {
  totalSubmissions: number;
  totalPoints: number;
  averageRawScore: number;
  averageTransmutedGrade: number;
  passingRate: number;
  passingCount: number;
  failingCount: number;
}

export interface TeacherAnalyticsResponseDTO {
  test: {
    id: string;
    title: string;
    sections: Array<{ section: { id: string; name: string } }>;
  };
  summary: AnalyticsSummaryDTO;
  gradebook: GradebookEntryDTO[];
  itemAnalysis: ItemAnalysisEntryDTO[];
  scoreDistribution: ScoreDistributionItemDTO[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin & Roster Upload Contracts
// ─────────────────────────────────────────────────────────────────────────────

export interface CreatedStudentSummary {
  lrn: string;
  username: string;
  initialPassword: string;
  firstName: string;
  lastName: string;
  sectionName: string;
}

export interface RosterUploadError {
  row: number;
  field?: string;
  message: string;
}

export interface RosterUploadResultDTO {
  message: string;
  totalParsed: number;
  successCount: number;
  failureCount: number;
  students: CreatedStudentSummary[];
  errors: RosterUploadError[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Form & Mutation Payloads
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateTestPayload {
  title: string;
  description?: string;
  examType: ExamType;
  subjectId?: string;
  sectionIds: string[];
  durationSeconds?: number | null;
  hasInfiniteTime?: boolean;
  issueDate?: string | null;
  dueDate?: string | null;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
}

export interface UpdateTestPayload extends Partial<CreateTestPayload> {
  isPublished?: boolean;
  isArchived?: boolean;
}

export interface AutosaveAnswerPayload {
  questionId: string;
  optionId?: string | null;
  textAnswer?: string | null;
  matchingPairs?: string | null;
}

export interface AnswerOverridePayload {
  questionId: string;
  points: number;
  teacherComment?: string;
}

export interface ManualGradingPayload {
  answerOverrides?: AnswerOverridePayload[];
  teacherNotes?: string;
}

export interface SpecialAccessPayload {
  studentId: string;
  customDueDate?: string | null;
  extendedSeconds?: number | null;
  isUnlocked?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic API Responses
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T = void> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T = void> = ApiSuccess<T> | ApiError;
