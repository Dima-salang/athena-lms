/** A row in the subjects list. */
export interface SubjectItem {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
}

export interface SubjectFormValues {
  name: string;
  code: string;
  description: string;
}

export const EMPTY_SUBJECT_FORM: SubjectFormValues = {
  name: "",
  code: "",
  description: "",
};
