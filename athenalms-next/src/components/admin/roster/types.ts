/** Shapes for the student import screen. */

export interface ImportedStudent {
  name: string;
  username: string;
  temporaryPassword: string;
  lrn: string;
}

export interface RosterUploadResponse {
  success: boolean;
  message: string;
  totalRecordsInFile: number;
  successfulCount: number;
  failedCount: number;
  validationErrors: Array<{ row: number; field?: string; message: string }>;
  creationErrors: Array<{ lrn: string; error: string }>;
  students: ImportedStudent[];
}
