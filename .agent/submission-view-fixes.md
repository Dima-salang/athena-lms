# Fixes for Submission Detail View Correct Answers

## Summary
Addressed user request to show the **Correct Answer** alongside the **Student's Answer** for all question types in the `SubmissionDetailPage`.

## Root Causes
1. **Frontend (MCQ):** The frontend relied on `option.isCorrect` which does not exist in the API response.
2. **Backend (T/F, Identification):** The `QuestionMapper` implicitly used the base `QuestionDto` mapping which failed to include subclass-specific fields like `correctAnswer` for True/False and Identification questions.

## Changes Made

### 1. Frontend (`SubmissionDetailPage.tsx`)
- **MCQ Fix:** Updated logic to use `question.correctOptionId` to identify and highlight the correct option.
- **Display Logic:** Verified that True/False and Identification questions display the correct answer string.

### 2. Backend (`QuestionMapper.java`)
- **Explicit Subclass Mapping:** Added explicit `toDto` methods for `MultipleChoiceQuestion`, `TrueFalseQuestion`, `IdentificationQuestion`, and `EssayQuestion`.
- **Reason:** This forces MapStruct to generate full mappings for each subclass, ensuring that fields like `correctAnswer` (present in T/F and Identification entities/DTOs but not the base Question) are correctly serialized in the API response.

## Outcome
- **Multiple Choice:** Correct answer box shown + correct highlighting in list.
- **True/False:** Correct answer box shown (due to Mapper fix).
- **Identification:** Correct answer box shown (due to Mapper fix).
- **Essay:** Unchanged (manual grading).

The teacher view `SubmissionDetailPage` is now feature-complete regarding answer keys.
