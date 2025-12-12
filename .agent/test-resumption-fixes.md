# Fixes for Test Resumption, Timer, and Submission View

## Summary
Fixed issues where:
1. Student answers were not reappearing after reloading the test page.
2. The timer was resetting to the full duration instead of showing remaining time.
3. True/False questions in the submission view were always shown as incorrect (red) and missing options.

## Changes Made

### 1. Backend: Correctly Resume Existing Submissions
**Issue:** `SubmissionService.startTest` was creating a NEW submission every time because it was checking `endTime` (which is always set as the deadline) instead of `submittedAt`.
**Fix:** 
- Added `findFirstByTestIdAndStudentIdAndSubmittedAtIsNull` to `SubmissionRepository`.
- Updated `SubmissionService.startTest` to use this method to find ongoing submissions.

**Result:**
- When a student returns to strict test, the backend returns the **existing submission**.
- Original `startTime` is preserved -> **Timer shows correct remaining time**.
- Existing `answers` are preserved -> **Answers populate correctly**.

### 2. Frontend: Improved Submission Detail View (`SubmissionDetailPage.tsx`)
**Issue:** True/False questions were treated like MCQs but lacked `options` with `isCorrect` flags (they use a simple `correctAnswer` string). This caused the "correctness" check to fail, defaulting to red (incorrect).
**Fix:**
- Separated rendering logic for `TRUE_FALSE` and `MULTIPLE_CHOICE`.
- **True/False Logic:**
  - Manually renders "True" and "False" options.
  - Compares `studentAnswer.textAnswer` (e.g., "true") with `question.correctAnswer` (e.g., "true").
  - Correctly visualizes Green (Correct/Selected) vs Red (Wrong/Selected).
- **MCQ Logic:**
  - Retained existing logic using `question.options`.

## Technical Details

### Files Modified:
- `src/main/java/com/athena/lms/athena_lms/repository/SubmissionRepository.java`: Added query method.
- `src/main/java/com/athena/lms/athena_lms/service/tests/SubmissionService.java`: Updated `startTest`.
- `src/frontend/athena-lms/src/pages/SubmissionDetailPage.tsx`: Updated rendering logic.

### Logic Flow for Timer Resumption:
1. `SubmissionService` finds existing submission.
2. Returns `SubmissionDto` with original `startTime`.
3. `TakeTestPage` calculates `endTime = startTime + duration`.
4. `initialTimeLeft = endTime - now`.
5. Timer starts at the correct `initialTimeLeft`.
