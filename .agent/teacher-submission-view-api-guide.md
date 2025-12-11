# Teacher Dashboard - Viewing Student Submissions

## Overview
For the teacher dashboard to view individual student submissions with full test details and student answers, the frontend should make **two separate API calls**:

## API Endpoints

### 1. Get Submission with Test Details
**Endpoint:** `GET /api/student/submissions/{submissionId}`

**Returns:** `SubmissionDto` which includes:
- Submission metadata (id, startTime, endTime, submittedAt, totalScore, attempts)
- `StudentDto` - Student information
- **`TestDto`** - Complete test with:
  - Test metadata (name, description, dates, duration)
  - **`questions[]`** - Array of questions with:
    - Question text, type, points
    - **`options[]`** - Array of options with:
      - Option ID
      - Option text
      - Whether it's correct

### 2. Get Student Answers
**Endpoint:** `GET /api/student/submissions/{submissionId}/answers`

**Returns:** `List<StudentAnswerDto>` which includes:
- Answer ID
- `QuestionDto` - The question being answered
- `optionId` - The ID of the option selected (for MCQ/True-False)
- `textAnswer` - Text answer (for Identification/Essay)
- `points` - Points awarded by teacher

## Frontend Implementation Pattern

```typescript
// Example: Viewing a student's submission
async function viewStudentSubmission(submissionId: number) {
  // 1. Fetch the submission with full test details
  const submission = await api.get(`/api/student/submissions/${submissionId}`);
  
  // 2. Fetch the student's answers
  const answers = await api.get(`/api/student/submissions/${submissionId}/answers`);
  
  // 3. Combine the data for display
  const testWithAnswers = {
    ...submission,
    questions: submission.test.questions.map(question => {
      // Find the student's answer for this question
      const studentAnswer = answers.find(a => a.question.id === question.id);
      
      return {
        ...question,
        studentAnswer: studentAnswer,
        selectedOption: question.options?.find(opt => opt.id === studentAnswer?.optionId)
      };
    })
  };
  
  return testWithAnswers;
}
```

## Data Structure Example

### Submission Response
```json
{
  "id": 1,
  "startTime": "2025-12-11T10:00:00Z",
  "endTime": "2025-12-11T11:00:00Z",
  "submittedAt": "2025-12-11T10:45:00Z",
  "totalScore": 85.0,
  "student": {
    "id": 5,
    "firstName": "John",
    "lastName": "Doe"
  },
  "test": {
    "id": 10,
    "testName": "Midterm Exam",
    "questions": [
      {
        "id": 100,
        "questionText": "What is 2+2?",
        "questionType": "MULTIPLE_CHOICE",
        "fullPoints": 10.0,
        "options": [
          {"id": 1001, "optionText": "3", "isCorrect": false},
          {"id": 1002, "optionText": "4", "isCorrect": true},
          {"id": 1003, "optionText": "5", "isCorrect": false}
        ]
      }
    ]
  }
}
```

### Student Answers Response
```json
[
  {
    "id": 500,
    "question": {
      "id": 100,
      "questionText": "What is 2+2?"
    },
    "optionId": 1002,
    "textAnswer": null,
    "points": 10.0
  }
]
```

## Benefits of This Approach

1. **Clean Separation**: Submission and answers are separate concerns
2. **No Circular References**: Avoids bidirectional DTO relationships
3. **Flexible**: Frontend can fetch answers only when needed
4. **Reusable**: The `getStudentAnswers` endpoint can be used independently
5. **Efficient**: Backend mappers handle the full test details automatically

## Notes

- The `TestDto` already includes all questions with their options through the mapper chain (`TestMapper` → `QuestionMapper` → `OptionMapper`)
- The `StudentAnswerDto` includes the `QuestionDto` for reference, but you should avoid setting the `submission` field to prevent circular references
- For display, match answers to questions using the question ID
