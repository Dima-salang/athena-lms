# Athena LMS: Next.js Migration & Architectural Implementation Plan

## Goal Description
Port the entire Spring Boot 3 + Vite React Athena LMS into a unified, high-performance, full-stack **Next.js 15+ (App Router)** project located in `/home/lgputan/Dev/athena-lms/athenalms-next`. The new system incorporates all existing features from the legacy codebase plus all functional requirements specified in `docs/reqs.md` and refined during the architectural interview:
- 6 Question Types (MCQ, Matching, True/False, Identification, Acronym, Essay)
- 4 Exam Types (Quiz, Long Test, Summative, Periodical) with Multi-Section and Template Duplication
- Special Access Overrides for individual students or batches
- Resilient Test-Taking Engine with Sticky Timer, Question Palette & Skipping, and Dual Autosave (Server + Local Storage)
- DepEd-Standard Transmutation Table with customizable grade scales
- Full Analytics Suite with Item Analysis (Difficulty & Discrimination Index), Recharts visual analytics, and Excel/CSV Export
- Roster Batch Provisioning via CSV/Excel & Manual Entry with pregenerated credentials and mandatory first-login password change
- Infrastructure & Network Security (IP Whitelist & Client Network Lock during exams)
- Modern, accessible UI/UX with `shadcn/ui`

---

## User Review Required
> [!IMPORTANT]
> The target application will reside cleanly in the `athenalms-next` subdirectory inside `/home/lgputan/Dev/athena-lms`. The existing Spring Boot code and Vite React frontend in `src/` remain completely untouched during development, ensuring zero risk of regression.

> [!NOTE]
> Database engine is configured as **SQLite via Prisma ORM** by default (storing data in `athenalms-next/prisma/athena.db`), with an environment configuration that allows immediate zero-code switching to **PostgreSQL** in production by swapping `DATABASE_URL`.

---

## Architectural Blueprint

```mermaid
graph TD
    subgraph Browser Client
        UI[shadcn/ui + Tailwind CSS]
        LocalStorage[Local Storage Offline Cache]
    end

    subgraph athenalms-next [Next.js App Router]
        MW[Edge Middleware: Auth & Role RBAC & Network IP Guard]
        subgraph App Routes
            AuthRoutes[/api/auth/*: Better Auth]
            AdminRoutes[/api/admin/*: Management & Rosters]
            TeacherRoutes[/api/teacher/*: Tests & Analytics]
            StudentRoutes[/api/student/*: Submissions & Autosave]
        end
        subgraph Core Engines
            GradeEngine[Auto-Grading & DepEd Transmutation Engine]
            AnalyticsEngine[Item Analysis & Difficulty/Discrimination]
            SecurityEngine[Client IP Lock & Integrity Monitor]
        end
        subgraph Data Access Layer
            Prisma[Prisma Client v6]
            DB[(SQLite / PostgreSQL)]
        end
    end

    UI --> MW
    UI <--> LocalStorage
    MW --> AuthRoutes
    MW --> AdminRoutes
    MW --> TeacherRoutes
    MW --> StudentRoutes
    TeacherRoutes --> GradeEngine
    StudentRoutes --> GradeEngine
    TeacherRoutes --> AnalyticsEngine
    StudentRoutes --> SecurityEngine
    AuthRoutes --> Prisma
    AdminRoutes --> Prisma
    TeacherRoutes --> Prisma
    StudentRoutes --> Prisma
    Prisma --> DB
```

---

## Directory Structure (`athenalms-next`)

```text
athenalms-next/
├── prisma/
│   ├── schema.prisma             # Complete database schema
│   ├── seed.ts                   # Initial seed data (Admin, Sample Sections, Subjects)
│   └── migrations/               # Prisma migrations
├── public/                       # Static assets
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth route group (login, register, change-password)
│   │   ├── (dashboard)/          # Authenticated app shell
│   │   │   ├── admin/            # Admin routes (users, sections, subjects, assignments, roster upload)
│   │   │   ├── teacher/          # Teacher routes (tests, editor, submissions, gradebook, analytics)
│   │   │   └── student/          # Student routes (dashboard, take test, view submissions)
│   │   ├── api/                  # Route handlers
│   │   │   ├── auth/             # Better Auth endpoints
│   │   │   ├── admin/            # Admin API endpoints
│   │   │   ├── teacher/          # Teacher API endpoints
│   │   │   └── student/          # Student API endpoints
│   │   ├── layout.tsx            # Root layout with providers & Toaster
│   │   └── globals.css           # Tailwind CSS + shadcn theme variables
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui primitives (button, card, dialog, table, tabs, etc.)
│   │   ├── exam/                 # Question editor, Question viewer, Question palette, Sticky timer
│   │   ├── analytics/            # Item analysis charts, Gradebook distribution, Export buttons
│   │   ├── layout/               # Header, Sidebar, Role-based navigation, User avatar menu
│   │   └── common/               # DataTable, FileUploader, StatusBadge, EmptyState
│   ├── lib/                      # Core utility libraries
│   │   ├── auth.ts               # Better Auth server configuration
│   │   ├── auth-client.ts        # Better Auth client hooks
│   │   ├── db.ts                 # Prisma singleton instance
│   │   ├── grading.ts            # Auto-grading, scoring algorithms, DepEd transmutation
│   │   ├── analytics.ts          # Item analysis (difficulty, discrimination)
│   │   ├── excel.ts              # SheetJS roster parser & gradebook exporter
│   │   ├── security.ts           # Client IP detector, network lock, password hasher
│   │   └── utils.ts              # Classnames merge & common formatters
│   ├── types/                    # Shared TypeScript interfaces & DTOs
│   └── middleware.ts             # Route guard, session check, forced-password-change redirect
├── package.json
├── tsconfig.json
├── components.json               # shadcn/ui configuration
├── tailwind.config.ts / postcss  # Tailwind styling
└── .env.example
```

---

## Phase-by-Phase Implementation Strategy

### Phase 1: Project Scaffold & Environment Initialization
1. Initialize Next.js 15 project in `athenalms-next` with TypeScript, Tailwind CSS, ESLint.
2. Configure package dependencies:
   - `@prisma/client`, `prisma`
   - `better-auth`
   - `@radix-ui` primitives, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`
   - `recharts` for visual analytics
   - `xlsx` for Excel roster import & export
   - `zod`, `react-hook-form`, `@hookform/resolvers`
3. Configure `components.json` for shadcn/ui and initialize UI primitives.

### Phase 2: Prisma Database Schema & Better Auth
1. Define comprehensive Prisma models mirroring and enhancing legacy models:
   - `User`, `StudentProfile` (LRN, SectionId, mustChangePassword), `TeacherProfile`, `AdminProfile`
   - `Section`, `Subject`, `TeacherAssignment`
   - `Test` (type: QUIZ, LONG_TEST, SUMMATIVE, PERIODICAL; duration, infiniteTime, dates, shuffle flags, maxScore)
   - `TestSection` (M:N mapping of tests to sections)
   - `Question` (type: MULTIPLE_CHOICE, MATCHING, TRUE_FALSE, IDENTIFICATION, ACRONYM, ESSAY; points, answer keys)
   - `Option` (for MCQ and Matching column pairs)
   - `SpecialAccess` (student-specific test unlock, custom due date/duration)
   - `Submission` (status, startTime, endTime, submittedAt, rawScore, transmutedGrade, clientIp)
   - `StudentAnswer` (optionId, textAnswer, matchingPairs, points, isFlagged)
   - `SystemConfig` (IP whitelists, network lock flags, transmutation formula settings)
2. Run database migration and execute seed script generating default `admin` and sample teacher/student.

### Phase 3: Authentication, Authorization & Security Engine
1. Configure Better Auth with credentials provider, session cookies, and user roles (`ADMIN`, `TEACHER`, `STUDENT`).
2. Implement Next.js `middleware.ts`:
   - Role-based route guard for `/admin/*`, `/teacher/*`, `/student/*`.
   - Intercept users with `mustChangePassword: true` and redirect to `/change-password` before granting dashboard access.
3. Build Network Security Guard (`security.ts`):
   - Client IP detection from request headers (`x-forwarded-for`).
   - Campus IP whitelist check against configured CIDRs.
   - Test-session IP lock verification on test autosaves and finalization.

### Phase 4: Academic Administration & Roster Management
1. **Section & Subject Management**: CRUD interfaces for sections, advisers, and subjects.
2. **Teacher Assignments**: Interactive matrix linking teachers to sections and subjects.
3. **Roster Provisioning**:
   - Manual student account creation modal.
   - Bulk Excel (.xlsx) / CSV file uploader with validation, pregenerated passwords, and downloadable credential summary sheet.
4. **User Management**: Unified table with search, role filters, password reset, and status toggle.

### Phase 5: Examination Authoring & Duplication Engine
1. **Test Management Dashboard**: List, filter, duplicate (template clone), and archive tests.
2. **Comprehensive Test Editor**:
   - General Settings: Title, Description, Type, Section assignments, Issue/Due dates, Duration, Randomization options.
   - Question Editor supporting all 6 formats:
     - MCQ with dynamic options and single/multi-choice answers.
     - True / False with boolean selector.
     - Identification with primary key and optional alternative synonyms.
     - Acronym with expansion and term.
     - Matching Type with Premise (Col A) $\leftrightarrow$ Response (Col B) pair editor.
     - Essay with point value and rubric guidelines.
   - Autosave with visual status indicator.
3. **Special Access Manager**: Dedicated dialog to grant individual or batch student overrides (custom time, unlock token, extended due date).

### Phase 6: Student Test Taking Experience
1. **Student Dashboard**: Shows upcoming, available, and past tests with status badges and due date warnings.
2. **Exam Interface (`/student/test/[testId]`)**:
   - Sticky top bar with test info, autosave status, and countdown timer.
   - Question Palette / Drawer displaying question statuses (answered, unanswered, skipped/flagged).
   - Dynamic renderers for all 6 question formats.
   - Dual autosave: Debounced API calls + real-time `localStorage` backup for zero data loss.
   - Auto-submit on timer expiration.
   - Anti-cheat tab-switch detection logging warnings.

### Phase 7: Grading, Transmutation & Review
1. **Auto-Grading Engine (`grading.ts`)**:
   - Immediate scoring on submission for objective questions.
   - Case-insensitive, trimmed matching for Identification and Acronym.
   - Pair-level scoring for Matching items.
2. **DepEd Transmutation Table (`grading.ts`)**:
   - Converts raw score percentage to DepEd transmuted grade (60–100 scale, 75 passing).
   - Configurable settings for alternative linear formulas.
3. **Teacher Grading & Review**:
   - Submission list with search and filter by section.
   - Submission detail view for reviewing student answers, manual score overrides, and essay grading.
   - Test-wide score recalculation button.

### Phase 9: Comprehensive Unit Testing & High Coverage (Vitest)
1. Setup Vitest, `@testing-library/react`, `@testing-library/jest-dom`, and `@vitest/coverage-v8`.
2. Configure threshold for near-complete code coverage ($\ge 90\%$) across all engine logic.
3. Implement test suites:
   - `src/lib/__tests__/grading.test.ts`: 100% branch and line coverage for all 6 question scoring models, edge cases, partial credits, case-folding, whitespace trimming.
   - `src/lib/__tests__/transmutation.test.ts`: DepEd transmutation table edge cases and boundary tests ($0\% \rightarrow 60$, $59.99\% \rightarrow 74$, $60\% \rightarrow 75$, $100\% \rightarrow 100$), custom scale formulas.
   - `src/lib/__tests__/analytics.test.ts`: Difficulty Index ($P$), Discrimination Index ($D$), distractor frequency calculations, zero-submission defenses.
   - `src/lib/__tests__/security.test.ts`: Client IP parsing, CIDR range checks, exam session IP lock verification.
   - `src/lib/__tests__/excel.test.ts`: SheetJS class list parsing, validation errors (missing LRN, duplicates), gradebook export generation.
   - `src/components/__tests__/StickyTimer.test.tsx`: Countdown behavior, sticky styling, auto-submit callback on zero.
   - `src/components/__tests__/QuestionPalette.test.tsx`: Status flags (answered, unanswered, skipped/flagged), jump navigation.
   - `src/components/__tests__/QuestionEditor.test.tsx`: Rendering and mutating all 6 question types.

### Phase 10: End-to-End (E2E) Testing (Playwright)
1. Setup and configure Playwright (`playwright.config.ts`) with web server lifecycle management.
2. Build end-to-end user journeys:
   - `e2e/admin-roster.spec.ts`: Admin login $\rightarrow$ section/subject creation $\rightarrow$ teacher assignment $\rightarrow$ class list Excel upload $\rightarrow$ student accounts verified.
   - `e2e/auth-guard.spec.ts`: Student first login with pregenerated password $\rightarrow$ forced redirect to password change $\rightarrow$ update password $\rightarrow$ dashboard unlocked.
   - `e2e/teacher-test.spec.ts`: Teacher authors exam with all 6 question types $\rightarrow$ assigns multiple sections $\rightarrow$ configures Special Access override $\rightarrow$ clones test as template.
   - `e2e/student-exam.spec.ts`: Student takes test $\rightarrow$ answers saved in real-time $\rightarrow$ navigates question palette $\rightarrow$ page refresh keeps state $\rightarrow$ submits exam $\rightarrow$ receives instant grade breakdown.
   - `e2e/grading-analytics.spec.ts`: Teacher opens submissions $\rightarrow$ grades essay $\rightarrow$ views Item Analysis ($P$ & $D$ indices) and Recharts charts $\rightarrow$ downloads Excel grade sheet.

---

## Verification Plan

### Automated Verification Commands
1. **Compilation & Type Check**:
   ```bash
   cd /home/lgputan/Dev/athena-lms/athenalms-next
   bun run build # or npm run build
   ```
2. **Comprehensive Unit Tests with Coverage**:
   ```bash
   cd /home/lgputan/Dev/athena-lms/athenalms-next
   bun run test:coverage # Runs Vitest with @vitest/coverage-v8
   ```
3. **End-to-End Test Suite**:
   ```bash
   cd /home/lgputan/Dev/athena-lms/athenalms-next
   bun x playwright test
   ```

### Manual Verification Flows
1. **Admin Flow**: Log in as `admin`, create Section and Subject, assign Teacher, upload class list via Excel, verify student accounts generated with `mustChangePassword`.
2. **Student First Login**: Log in with pregenerated password, verify forced password change modal, submit new password, access dashboard.
3. **Teacher Flow**: Author a test with all 6 question types, set timer and sections, duplicate test, test autosave, view Special Access override.
4. **Student Exam Flow**: Start exam, test question palette and skipping, test timer countdown, verify answers persist after page refresh, submit exam, verify auto-grading and transmuted grade.
5. **Teacher Analytics Flow**: Review submissions, grade essay, view Item Analysis and Recharts grade distribution, export Excel report.
