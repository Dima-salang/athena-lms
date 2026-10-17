# UI Refresh — Phase 3 Changelog (Teacher) + UX hardening

**Status: implemented.** Built in the order below. See “Deviations” at the end for the
few places the implementation landed slightly differently from the plan.

Planned before building. Each entry: **what** changes and **why**. Nothing here alters
URLs, the database schema, existing API contracts, or grading/transmutation logic.
Additive API routes are marked.

---

## 1. Spacing, rhythm, and "bunched"/overlapping elements

The current teacher screens stack everything with `space-y-6` and rely on hover-only
overlays, which reads as cramped and occasionally overlaps content.

- [x] Introduce one vertical rhythm: page sections `space-y-8`, form groups `space-y-6`,
      a field `space-y-2`. Applied across every teacher page.
- [x] **Fix overlap:** the "Duplicate question" action in the test editor is an
      `absolute right-14 top-6` hover overlay on top of the question card. Move it into the
      question card's own action row (no absolute positioning, always visible on touch).
- [x] **Fix nested cards:** strip wrapper `<Card>` around components that already render
      their own card surface (double border/padding).
- [x] Give dialogs a real layout: `gap-6` between header / body / footer, `p-6` body,
      grouped fields instead of one long `space-y-4` column.
- [x] Tables: consistent cell padding (`py-3`), sticky header, and a horizontal scroll
      wrapper on small screens.
- [x] Tabs content gets breathing room (`pt-4`) so panels don't touch the tab strip.

New primitives to make this repeatable:
- [x] `FormSection` — titled group (`border-t pt-6`) so related controls sit together.
- [x] `FormField` — label + control + hint with uniform spacing.
- [x] `CheckboxField` — checkbox + label + explanation on one comfortable row.

## 2. Logical placement of controls (not "sequentially bunched")

- [x] **Create test** page: regroup into *Basics* (title, type, subject, instructions),
      *Schedule* (duration + no-time-limit on one row, deadline), *Distribution*
      (sections), *Options* (shuffle toggles). Primary action pinned in the footer.
- [x] **Test settings dialog**: same grouping; "No time limit" sits next to duration,
      issue/due dates share a row, randomization toggles move under their own heading.
- [x] Titles/labels/actions paired where the eye expects them (page title → actions top
      right; destructive actions separated from primary ones).

## 3. Feedback for every action

- [x] Mount Sonner toast host (already added in Phase 2) and use it everywhere:
      publish / unpublish, autosave succeeded / failed, duplicate, archive, recalculate,
      export, add / delete / duplicate question, special-access grant / revoke.
- [x] New `ConfirmDialog` + `useConfirm()` hook (promise-based) replacing **all** native
      `confirm()` / `alert()` (test editor, tests list, submissions, special access,
      admin pages in Phase 4).
- [x] **Crucial actions require confirmation:** publishing (explains students will see it),
      archiving/deleting a test, recalculating all scores, revoking special access.
- [x] Subtle motion so the user sees something happened: `animate-rise` on newly added
      question cards, button spinners during async work, saving/saved pill with icon,
      success/error toasts, and a brief highlight on the row/record changed.

## 4. Test editor: autosave + sticky status bar

- [x] **Remove the "Save all" button.** Every change autosaves (~800 ms debounce).
- [x] New lenient draft endpoint `PUT /api/teacher/tests/[id]/draft` *(additive)* so
      incomplete questions can be saved while authoring; the existing strict
      `POST .../questions` route is kept for compatibility. Shared upsert logic extracted
      to `src/lib/questions-persistence.ts`.
- [x] **Floating sticky bar** that follows the teacher down the page with:
      - Save status: `Saved · just now` / `Saving…` / `Unsaved changes` / `Save failed` (retry).
      - Publish / unpublish (with confirmation).
      - Exam essentials at a glance: title, published state, question count, total points,
        duration, deadline.
      - Links: Submissions, Analytics, Special access.
      - Sticky on desktop and mobile; collapses gracefully at ~375 px.
- [x] Publish refuses to run while the test is invalid, and lists exactly what to fix
      (each question's problem, with a jump link).

## 5. Filters for search fields

- [x] **Tests list**: search (live, debounced) + filters — status (all/published/draft),
      exam type, section, subject — and sort (recently updated, recently created,
      deadline, title A–Z). Empty/!filtered states get a clear message and a reset action.
- [x] **Submissions list**: live search (name/LRN) + status filter + section filter + sort
      (recently submitted, score, name). 
- [x] **Student dashboard**: search + filters + sort (see §6).

## 6. Student dashboard sorting & filters

- [x] Default sort: **recently published** (by issue date, falling back to creation date).
- [x] Sort options: *Recently published* (default) and **Deadline soonest**.
- [x] Filters: search by title/subject, filter by exam type, filter by status
      (available / upcoming / completed).
- [x] Add `createdAt` to the student test payload so "recently published" is well-defined.

## 7. Item analysis: plain-language + Excel export

- [x] Reword: it is **how many students got each item right vs wrong**, not a
      psychometrics report. Primary columns become **Correct**, **Wrong**, **% correct**
      with a simple bar. Difficulty/discrimination move behind a "Show advanced metrics"
      toggle (kept, just demoted and renamed).
- [x] Extract analytics computation into `src/lib/test-analytics.ts` shared by the
      analytics screen and the export route (no duplicated logic).
- [x] **Excel export of item analysis:** new route
      `GET /api/teacher/tests/[id]/analytics/export` *(additive)* producing an `.xlsx`
      with per-item correct / wrong / % correct (and the advanced indices in extra
      columns). Gradebook export stays as its own button.
- [x] Terminology: remove "DepEd", "psychometrics", "transmuted scale" → "converted
      grade", "grading scale".

## 8. God-component splits (Phase 3 scope)

| File | Lines | Becomes |
|---|---|---|
| `teacher/tests/[id]/edit/page.tsx` | 686 | `components/teacher/test-editor/*` + `use-test-editor` hook |
| `teacher/tests/create/page.tsx` | 317 | `components/teacher/create-test/*` + hook |
| `teacher/tests/[id]/submissions/page.tsx` | 313 | `components/teacher/submissions/*` |
| `teacher/tests/[id]/special-access/page.tsx` | 421 | `components/teacher/special-access/*` |
| `teacher/tests/[id]/analytics/page.tsx` | 334 | `components/teacher/analytics/*` |
| `teacher/tests/page.tsx` | 253 | `components/teacher/tests/*` (filters + table) |

Target ≈ 150–250 lines per page; data fetching in hooks.

## 9. Colour & terminology pass (teacher)

- [x] Replace hardcoded `emerald/blue/amber/indigo/gray` with `success` / `primary` /
      `warning` / `destructive` / token colours (light + dark correct).
- [x] Plain copy: "Faculty Assessment Portal" → "Teacher dashboard";
      "Examinations Catalogue" → "Tests"; "Create Examination" → "Create test";
      "Author examinations, review automated checking results…" → plain wording;
      "DepEd Transmuted Grade" → "Converted grade"; drop "psychometrics".
- [x] Update `e2e` selectors where headings/labels changed.

## 10. Mobile

- [x] Sticky editor bar and filter rows wrap cleanly; tables scroll horizontally with a
      visible affordance; dialogs become near-full-width sheets on small screens.

---

### Deviations from the plan

- **Tests-list sort** offers *Recently updated*, *Deadline soonest*, and *Title (A–Z)*
  (no “recently created” — the teacher list payload has no `createdAt`).
- **Item-analysis export** is a dedicated workbook/button
  (`.../analytics/export`) rather than an extra sheet in the gradebook workbook.
- **Analytics** splits into `AnalyticsSummary`, `GradebookTable`, and the simplified
  `ItemAnalysisTable`; the score-distribution card is reused as-is.
- **Special access** splits into `SpecialAccessDialog` + `OverridesTable`.
- A **“Save now”** convenience button remains in the editor footer in addition to
  autosave (autosave alone is sufficient; this just gives a manual nudge).
- **Mobile**: the tests list switches to cards below `md`; other tables scroll
  horizontally.

### Out of scope / risks
- No URL, schema, grading, or auth changes. Draft endpoint + analytics export endpoint are
  additive.
- Copy changes can affect `e2e/*.spec.ts` selectors → update specs as needed.
- `QuestionEditor` / `QuestionPalette` unit tests keep their export paths; only internal
  markup and token classes change.
