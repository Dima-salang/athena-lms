/** Types shared by more than one admin feature. */

/** A minimal picker option (a section, subject, …). */
export interface OptionItem {
  id: string;
  name: string;
  isActive?: boolean;
}

/** The school year used as the default in admin forms. */
export const DEFAULT_SCHOOL_YEAR = "2026-2027";
