# Athena LMS — UI Refresh Plan

Status: **draft for approval** (nothing built yet)
Scope agreed: entire UI (auth + admin + teacher + student), all roles.

---

## 1. Goal & principles

Make the whole interface **proper, mobile-friendly, and plain-spoken**, with no god components
and no flashy marketing language.

Direction: **Refined school / institutional** — calm, deliberate, trustworthy. Not maximalist,
not "AI slop."

Principles:
1. **Plain words.** Buttons and headings say what they do. No "provisioning", "jurisdiction",
   "taxonomy", "psychometrics", "DepEd", "parallel examinations".
2. **One screen, one job.** Every page composes small named pieces. No file a human can't hold
   in their head (~150–250 lines max per page).
3. **Mobile first.** Phones get real navigation, real layouts, tappable targets, readable text.
4. **Legible by default.** Kill `text-[10px]` / `text-[11px]`. Body text ≥ 14px, UI labels ≥ 12px.
5. **Consistent vocabulary.** Same action = same label everywhere (e.g. always "New test").
6. **Restrained motion.** Small, purposeful, respects `prefers-reduced-motion`.

---

## 2. Palette — "Pine + warm stone + gold"

Replaces the default shadcn blue + cold slate. Pine for action/identity, warm stone for surfaces,
gold for highlights (dues, warnings, accents). Green/amber/red reserved for status.

Values are HSL channel triplets (shadcn convention), consumed as `hsl(var(--x))`.

### Light

| Token | Value | Notes |
|---|---|---|
| `--background` | `48 33% 98%` | warm paper, not pure white |
| `--foreground` | `24 10% 10%` | warm near-black |
| `--card` | `0 0% 100%` | crisp surface |
| `--card-foreground` | `24 10% 10%` | |
| `--popover` | `0 0% 100%` | |
| `--popover-foreground` | `24 10% 10%` | |
| `--primary` | `161 41% 25%` | **deep pine** |
| `--primary-foreground` | `45 40% 98%` | warm white |
| `--secondary` | `40 14% 94%` | warm stone surface |
| `--secondary-foreground` | `24 12% 16%` | |
| `--muted` | `40 14% 94%` | |
| `--muted-foreground` | `25 8% 42%` | warm grey text |
| `--accent` | `40 20% 92%` | hover surface |
| `--accent-foreground` | `24 12% 16%` | |
| `--destructive` | `4 62% 45%` | warm brick red |
| `--destructive-foreground` | `40 40% 98%` | |
| `--border` | `34 14% 88%` | warm hairline |
| `--input` | `34 14% 86%` | |
| `--ring` | `161 41% 25%` | pine focus ring |
| `--gold` | `38 62% 45%` | highlights / due dates |
| `--gold-foreground` | `40 40% 98%` | |
| `--success` | `152 45% 32%` | passed / published |
| `--success-foreground` | `40 40% 98%` | |
| `--warning` | `38 62% 45%` | same family as gold |
| `--warning-foreground` | `40 40% 98%` | |
| `--radius` | `0.5rem` | slightly tighter, more "documented" |

### Dark

| Token | Value |
|---|---|
| `--background` | `24 10% 8%` |
| `--foreground` | `40 20% 94%` |
| `--card` | `24 9% 11%` |
| `--card-foreground` | `40 20% 94%` |
| `--popover` | `24 9% 11%` |
| `--popover-foreground` | `40 20% 94%` |
| `--primary` | `158 42% 52%` (lighter pine for contrast) |
| `--primary-foreground` | `24 20% 8%` |
| `--secondary` | `24 8% 16%` |
| `--secondary-foreground` | `40 20% 94%` |
| `--muted` | `24 8% 16%` |
| `--muted-foreground` | `35 10% 65%` |
| `--accent` | `24 8% 18%` |
| `--accent-foreground` | `40 20% 94%` |
| `--destructive` | `4 58% 50%` |
| `--destructive-foreground` | `40 40% 98%` |
| `--border` | `24 8% 20%` |
| `--input` | `24 8% 22%` |
| `--ring` | `158 42% 52%` |
| `--gold` | `40 55% 55%` |
| `--success` | `152 40% 45%` |

Remove all hardcoded palette classes in pages (`text-emerald-600`, `bg-blue-50`,
`text-indigo-600`, `text-amber-700`, …) and route them through semantic tokens
(`text-success`, `bg-primary/10`, `text-warning`, …).

---

## 3. Typography

Loaded with `next/font` (self-hosted, no layout shift, no network at runtime).

| Role | Family | Usage |
|---|---|---|
| Display | **Fraunces** (optical-size serif) | page titles, big numbers, section headers |
| Body / UI | **Public Sans** | everything else: body, labels, buttons, tables, forms |
| Mono (optional) | **IBM Plex Mono** | LRN, codes, scores where alignment matters |

Wiring (Tailwind v4 + Next 15):
- `src/app/fonts.ts` exports `fraunces` and `publicSans` with `variable: "--font-display"` /
  `"--font-sans"`.
- `globals.css` maps them in `@theme inline`:
  `--font-sans: var(--font-sans); --font-display: var(--font-display);`
- Root layout applies both variable classes to `<body>`.
- `h1–h3`, `.font-display`, stat numbers use the display face; body inherits `font-sans`.

Type scale (tokens, not ad-hoc):
- Page title: 24–30px, display, tight tracking.
- Section title: 16–18px, semibold.
- Body: 14px (`text-sm`).
- Label/caption: 12px (`text-xs`) — **minimum anywhere**.

---

## 4. Shape, elevation, motion

- **Radius:** `--radius: 0.5rem`; cards/buttons align to it; pills stay full-round.
- **Borders:** warm hairline; prefer borders over heavy shadows for the "documented" feel.
- **Shadows:** one soft elevation token; hover raises subtly. No layered drop-shadow soup.
- **Motion (CSS-first):**
  - Page/section reveal: fade + 4–8px rise, 200–300ms, staggered on dashboards.
  - Card hover: border → `primary/40`, tiny lift.
  - Buttons/rows: 150ms color/shadow.
  - All wrapped in `@media (prefers-reduced-motion: reduce)` → instant.

---

## 5. App shell (fixes "no mobile nav")

Target file set:

| New/changed file | Purpose |
|---|---|
| `src/components/layout/nav-config.ts` | single source: `getNavLinks(role)` → `{href,label,icon}[]` + active-match helper |
| `src/components/layout/SidebarNav.tsx` | presentational link list, used by both sidebar & drawer |
| `src/components/layout/Sidebar.tsx` | desktop rail; consumes `SidebarNav` |
| `src/components/layout/MobileNav.tsx` | hamburger → `Sheet` (existing `ui/sheet.tsx`) with `SidebarNav` |
| `src/components/layout/Navbar.tsx` | add hamburger (mobile), keep brand + user menu |
| `src/components/layout/ThemeToggle.tsx` | sun/moon, `next-themes` |
| `src/components/providers/ThemeProvider.tsx` | wrap `next-themes` `ThemeProvider` |
| `src/components/layout/PageHeader.tsx` | reusable title + description + actions row |

`(dashboard)/layout.tsx`:
- wrap in `ThemeProvider`;
- `Navbar` (with mobile hamburger + theme toggle) on top;
- `Sidebar` desktop-only (unchanged breakpoint behavior) + `main` with consistent padding.

Nav labels de-jargoned: "User Management" → "Users", "Roster Upload" → "Import students",
"Teacher Assignments" → "Teacher classes", "My Tests" → "Tests".

---

## 6. Shared UI building blocks (new)

Extract repeated patterns so pages shrink:

| Component | Replaces |
|---|---|
| `ui/page-header.tsx` | every hand-rolled `h1` + subtitle + button row |
| `ui/stat-card.tsx` | dashboard metric cards (teacher/admin/student) |
| `ui/empty-state.tsx` | the many inline "nothing here" cards |
| `ui/status-badge.tsx` | ad-hoc Published/Draft/Passed/In progress badges → one status→(label,variant) map |
| `ui/loading-state.tsx` | spinners + soon skeletons |
| `ui/responsive-table.tsx` | tables that overflow on mobile (scroll wrapper + optional stacked cards) |
| `ui/form-field.tsx` | label + input + error wrapper for react-hook-form |
| `ui/confirm-dialog.tsx` | destructive confirms (logout, delete, override) |

Badge variants extended: `success`, `warning`, `gold`, `info` map to the new tokens.

---

## 7. God-component breakdown

Every target page becomes a thin orchestrator + named children. Data fetching/state moves into
hooks (`src/hooks/`), UI into `src/components/<feature>/`.

| Current (lines) | Split into |
|---|---|
| `teacher/tests/[id]/edit/page.tsx` (686) | `hooks/useTestEditor.ts`; `components/teacher/test-editor/{TestEditor,EditorHeader,TestSettingsForm,QuestionList,QuestionCard,SaveStatus}.tsx`. `TestSettingsForm` shared with **create**. |
| `student/test/[id]/page.tsx` (562) | `hooks/useExamSession.ts`; `components/exam/runner/{ExamRunner,ExamQuestionView,ExamNavigator,SubmitDialog,ExamStatusBar}.tsx` |
| `components/exam/QuestionEditor.tsx` (465) | `components/exam/question-editor/{QuestionEditor,ChoiceList,MatchingPairs,AnswerKeyFields,Types}.tsx`; keep public export name so existing tests pass |
| `teacher/submissions/[id]/page.tsx` (431) | `hooks/useSubmissionDetail.ts`; `components/teacher/submission/{SubmissionHeader,AnswerReviewList,ManualScoreForm,ScoreSummary}.tsx` |
| `teacher/tests/[id]/special-access/page.tsx` (421) | `hooks/useSpecialAccess.ts`; `components/teacher/special-access/{AccessForm,StudentPicker,GrantList}.tsx` |
| `admin/users/page.tsx` (370) | `hooks/useUsers.ts`; `components/admin/users/{UserTable,UserFilters,UserFormDialog,ResetPasswordDialog}.tsx` |
| `teacher/tests/[id]/analytics/page.tsx` (334) | `hooks/useTestAnalytics.ts`; `components/teacher/analytics/{SummaryStats,ItemAnalysisTable,ScoreDistributionChart}.tsx` (reuse existing analytics components) |
| `teacher/tests/create/page.tsx` (317) | reuse `TestSettingsForm` + `QuestionList`; keep page thin |
| `admin/teacher-assignments/page.tsx` (317) | `hooks/useAssignments.ts`; `components/admin/assignments/{AssignmentForm,AssignmentTable}.tsx` |
| `teacher/tests/[id]/submissions/page.tsx` (313) | `components/teacher/submissions/{SubmissionsTable,SubmissionsToolbar}.tsx` |
| `student/submissions/[id]/page.tsx` (292) | `components/student/result/{ResultSummary,QuestionReviewList}.tsx` |
| `teacher/tests/page.tsx` (253) | `components/teacher/tests/{TestGrid,TestCard}.tsx` |
| `admin/sections/page.tsx` (238) | `components/admin/sections/{SectionTable,SectionFormDialog}.tsx` |
| `admin/subjects/page.tsx` (221) | `components/admin/subjects/{SubjectTable,SubjectFormDialog}.tsx` |
| `admin/roster-upload/page.tsx` (198) | `components/admin/roster/{UploadStep,PreviewStep,ResultStep}.tsx` |
| `(auth)/register`, `(auth)/change-password`, `admin/page`, `teacher/page`, `student/page` | copy + visual only; extract `AuthShell` for the three auth pages |

Shared additions: `hooks/useApiResource.ts` (tiny fetch/loading/error helper) used by
client pages so error/loading handling is identical everywhere.

---

## 8. Terminology — before → after (user-facing copy only)

Routes, DB columns, and identifiers are **unchanged**. Full sweep during build; representative set:

| Before | After |
|---|---|
| "Faculty Assessment Portal" | "Welcome back" / "Your tests" |
| "Authored Tests" | "Tests created" |
| "Student Submissions" | "Submitted tests" |
| "Quick Duplication" | "Copy a test" |
| "Create Examination" | "New test" |
| "View Test Catalogue" | "View all tests" |
| "Institutional Administration" | "School settings" |
| "Batch Roster Provisioning" | "Import students" |
| "Upload Class Roster" | "Import student list" |
| "pregenerated credentials" | "logins created for them" |
| "Teacher Subject Assignments" | "Teacher classes" |
| "jurisdiction" | "classes" |
| "academic taxonomy" | "subjects and sections" |
| "Course catalogue items" | "Subjects offered" |
| "class cohorts" | "classes" |
| "DepEd transmutation" | "automatic grade conversion" |
| "transmuted grade" | "converted grade" |
| "parallel examinations" | "different versions of a test" |
| "psychometrics" / "item analysis" / "discrimination" / "distractor" | "score analysis" / "Question analysis" / "how well a question worked" / "how many chose each option" |
| "Analytics" (nav/buttons) | "Results" |
| "Resume Exam" / "Start Exam" | "Resume test" / "Start test" |
| "No Time Limit" | "No time limit" |
| "Enter your credentials to access the examination portal" | "Sign in to your account" |
| metadata "Academic Examination & Assessment Platform … parallel examinations, auto-grading, and DepEd transmutation" | plain: "Tests, grading, and results for your school." |

More (from the file inventory):

| Before | After |
|---|---|
| "Examinations Catalogue" | "Tests" |
| "Manage, duplicate as templates, and monitor all your academic assessments." | "Create tests, copy them, and see results." |
| "Faculty Assignments" / "Assign Teacher to Section & Subject" | "Teacher classes" / "Assign a teacher" |
| "Map faculty teachers to authorized sections and academic subjects." | "Give a teacher access to a class and subject." |
| "Academic Subjects" / "Manage course disciplines and curriculum offerings." | "Subjects" / "Subjects your school offers." |
| "Class Sections" / "Configure academic grade cohorts and adviser assignments." | "Sections" / "Classes and their advisers." |
| "Roster Batch Provisioning" | "Import students" |
| "Bulk-import students … generated … mandatory first-login password changes." | "Upload a class list. Accounts and first-time passwords are created for each student." |
| "Special Access & Accommodations" / "Grant Student Override" | "Extra time & access" / "Give a student extra time" |
| "Grant extended testing time, custom deadlines, or unlock access past deadline." | "Give one student more time, a later deadline, or open a closed test." |
| "Academic Integrity Notice" | "Keep this window open" |
| "Institutional IP lock is active to ensure academic integrity." | "This test must be taken on the school network." |
| "Contact your instructor or exam proctor to request special access unlock." | "Ask your teacher for access." |
| "Item Analysis (Difficulty & Discrimination)" | "Question analysis" |
| "Difficulty (P)" / "Discrimination (D)" | "How easy" / "How well it separates" |
| "DepEd Transmuted Grade" / "DepEd Transmuted Scale" | "Converted grade" |
| "DepEd Performance Level Distribution" | "Grade distribution" |
| "Outstanding / Very Satisfactory / Satisfactory / Fairly Satisfactory / Did Not Meet Expectations" | keep the plain-English descriptors, drop the "(90–100)" coding in the label (show the number separately) |
| "DepEd descriptor" (code) | "grade remark" |
| "Recalculate All Scores" / "re-evaluated … against the current answer key" | "Recalculate scores" / "score again using the current answer key" |
| "Authored …" anywhere | "created" |
| "Exam" / "examination" in user copy | "test" (keep "exam" only in `examType` values like "Periodical Exam") |
| "Enable … anti-cheating randomization" | "Shuffle questions and choices" |

Rule: **no adjective that doesn't inform.** If a word can be cut without losing meaning, cut it.

---

## 9. Mobile & accessibility rules

- No `grid-cols-N` without a responsive prefix; every page verified at 375px.
- Tables: wrap in horizontal scroll **or** collapse to stacked label/value cards under `md`.
- Tap targets ≥ 44px on mobile; icon-only buttons get `aria-label`.
- Remove every `text-[10px]` / `text-[11px]` (≈6 files); smallest text is `text-xs`.
- Dialogs/forms: single column on mobile, full-width actions, `Sheet` for long mobile forms.
- Focus-visible ring on all interactive elements (pine ring).
- Loading = skeletons where feasible; no bare centered spinner for full pages.
- `aria-current="page"` on active nav link.
- Replace native `alert()` / `confirm()` with the **Sonner toast** (already installed, never used) and the `ConfirmDialog` primitive. Affected: test editor, exam timer, analytics export, user delete, assignment delete, override delete, test archive, submissions recalculate.

### Concrete fixes (from inventory)

**Tiny text to remove** (`text-[10px]` / `text-[11px]`):
`QuestionEditor` (×4), `teacher/submissions/[id]` (badge), `admin/users`, `analytics` (×3),
`student/submissions/[id]` (×3), `teacher/tests` (×3), `roster-upload`, `ItemAnalysisTable` (×2),
plus chart tick `fontSize: 11` in `ScoreDistributionChart`.

**Tables missing an `overflow-x-auto` wrapper** → wrap (or stack on mobile):
`admin/users`, `admin/teacher-assignments`, `admin/sections`, `admin/subjects`,
`teacher/tests` catalogue, `roster-upload` result.

**`grid-cols-N` with no responsive prefix** → add mobile base of 1 (or 2):
edit Settings dialog (×2), `QuestionEditor` T/F, `QuestionRenderer` T/F, `QuestionPalette` (×5),
`admin/users` dialog (×2), `admin/sections` dialog, `admin/subjects` dialog.

**Fixed widths to make fluid**: `QuestionEditor` select `w-48` / points `w-20`, users
`SelectTrigger w-40`, submissions filter `w-36`, tests search `max-w-md`, analytics `TabsList sm:w-[480px]`.

**Icon-only buttons needing `aria-label`**: teacher test-row actions (Users/Chart/Key/Copy/Trash),
`QuestionEditor` delete-question, admin delete buttons, `special-access` delete, create-page back
link, exam mobile-menu button.

**Clickable non-semantic elements** → real `<button>` / add `role`+`tabIndex`+key handler:
`roster-upload` dropzone (`<div onClick>`), `QuestionRenderer` MCQ option wrapper (`<div onClick>`).

**Focus states**: add `focus-visible` ring to custom pill/toggle buttons (edit + create section
pickers) and the roster dropzone.

---

## 10. Phases & verification

**Phase 1 — Foundation (no page logic changes)**
Fonts, palette (light+dark), ThemeProvider + toggle, nav-config, mobile sheet nav,
PageHeader/StatCard/EmptyState/StatusBadge primitives, global copy pass on shell + auth.
→ `npm run build` + `npm test`. **Done.**

**Phase 2 — Student**
Exam runner split, student dashboard, test page, result page.
→ build + test + manual 375px check. **Done.**

**Phase 3 — Teacher**
Test editor split, create/edit, submissions list + detail, special access, results.
→ build + test. **Done** — see `docs/ui-refresh-phase3-changelog.md`.

**Phase 4 — Admin**
Users, sections, subjects, teacher classes, roster import, admin dashboard.
→ build + test (+ e2e where a DB is available). *Not started.*

Each phase: one commit, message `ui(phase-N): …`. e2e specs (`e2e/*.spec.ts`) re-run at the end;
they may need selector updates if labels change — treated as expected churn.

---

## 11. Out of scope / risks

- **Not touching:** URLs, Prisma schema, API contracts, business logic, grading/transmutation,
  auth.
- **Risk:** renamed button/heading text can break e2e selectors → will update specs as needed.
- **Risk:** `QuestionEditor`/`QuestionPalette` unit tests import these components → preserve
  export paths/names or update tests.
- **Risk:** dark mode reveals contrast issues in charts (recharts) → chart colors routed through
  tokens.
- **cmdk (command palette)** and other unused deps stay untouched.

---

## 12. Alternate visual direction — "Cobalt Kiosk" (branch `feat/ui-neobrutalist`)

The plan above describes the **refined / institutional** direction ("Pine + warm stone + gold"),
delivered in Phases 1–3 on `feat/ui-refresh`.

A second, complete restyle exists on **`feat/ui-neobrutalist`**: a retro-futurist neobrutalist
skin — bone graph paper, cobalt + electric lime, 2px ink borders, hard offset shadows, square
corners, Archivo Black / Archivo / Space Mono. It changes **only the design layer**: same pages,
same copy, same routes, same APIs, same tests.

See `docs/ui-neobrutalist-changelog.md`. The two can be compared by switching branches.
