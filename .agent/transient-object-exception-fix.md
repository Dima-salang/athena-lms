# Fix for TransientObjectException in SubmissionService

## Problem
Students were getting `TransientObjectException` errors when:
1. **Autosaving answers** during the test (via `createOrUpdateStudentAnswers`)
2. **Submitting the test** (via `submitTest`)

### Error Message:
```
org.hibernate.TransientObjectException: persistent instance references an unsaved transient instance of 'com.athena.lms.athena_lms.model.options.Option' (save the transient instance before flushing)
```

## Root Cause
The `StudentAnswerMapper` was creating **new transient entities** for `Submission`, `Question`, and `Option` when mapping from DTOs. When Hibernate tried to save the `StudentAnswer`, it encountered these unsaved (transient) entities and threw an exception.

### Why This Happened:
- MapStruct mappers create new entity instances from DTOs
- These new instances are not managed by Hibernate's persistence context
- When saving `StudentAnswer`, Hibernate tries to cascade save these transient entities
- Since they're not properly managed, it fails

## Solution
**Manually fetch managed entities from the database** instead of using the mapper to create them.

### Changes Made:

#### 1. Added `QuestionRepository` to `SubmissionService`
```java
private final QuestionRepository questionRepository;

public SubmissionService(..., QuestionRepository questionRepository, ...) {
    ...
    this.questionRepository = questionRepository;
}
```

#### 2. Fixed `createOrUpdateStudentAnswers` Method
**Before:**
```java
StudentAnswer studentAnswer = studentAnswerMapper.toEntity(studentAnswerDto);
// This creates transient entities!
```

**After:**
```java
// Create new answer manually
StudentAnswer studentAnswer = new StudentAnswer();
studentAnswer.setTextAnswer(studentAnswerDto.getTextAnswer());
studentAnswer.setPoints(studentAnswerDto.getPoints());

// Fetch managed entities from database
if (studentAnswerDto.getSubmission() != null && studentAnswerDto.getSubmission().getId() != null) {
    Submission submission = submissionRepository.findById(studentAnswerDto.getSubmission().getId())
            .orElseThrow(() -> new NotFoundException("Submission not found"));
    studentAnswer.setSubmission(submission);
}

if (studentAnswerDto.getQuestion() != null && studentAnswerDto.getQuestion().getId() != null) {
    Question question = questionRepository.findById(studentAnswerDto.getQuestion().getId())
            .orElseThrow(() -> new NotFoundException("Question not found"));
    studentAnswer.setQuestion(question);
}

if (studentAnswerDto.getOptionId() != null) {
    Option option = optionRepository.findById(studentAnswerDto.getOptionId())
            .orElseThrow(() -> new NotFoundException("Option not found"));
    studentAnswer.setOption(option);
}
```

#### 3. Fixed `submitTest` Method
**Before:**
```java
StudentAnswer answer = studentAnswerMapper.toEntity(dto);
// Creates transient entities!
```

**After:**
```java
// Create new answer manually
StudentAnswer answer = new StudentAnswer();
answer.setTextAnswer(dto.getTextAnswer());
answer.setPoints(dto.getPoints());

// Set the submission (already managed)
answer.setSubmission(submission);

// Fetch and set managed Question entity
if (dto.getQuestion() != null && dto.getQuestion().getId() != null) {
    Question question = questionRepository.findById(dto.getQuestion().getId())
            .orElseThrow(() -> new NotFoundException("Question not found"));
    answer.setQuestion(question);
}

// Only fetch option if optionId is not null
if (dto.getOptionId() != null) {
    Option option = optionRepository.findById(dto.getOptionId())
            .orElseThrow(() -> new NotFoundException("Option not found"));
    answer.setOption(option);
}
```

## Key Principles

### ✅ DO:
- Fetch entities from repositories to get managed instances
- Use `findById()` to get entities that are already in the database
- Set managed entities on your new entities before saving

### ❌ DON'T:
- Use mappers to create entities with relationships to other entities
- Create new entity instances for relationships (use existing ones from DB)
- Save transient entities without fetching them first

## Benefits of This Fix

1. **No More TransientObjectException**: All entities are properly managed
2. **Correct Data Integrity**: References existing database records
3. **Better Error Handling**: Throws `NotFoundException` if referenced entities don't exist
4. **Clearer Code**: Explicit about what entities are being fetched and set

## Testing
The fix resolves both issues:
- ✅ Students can autosave answers during the test
- ✅ Students can submit the test successfully
- ✅ All entity relationships are properly maintained
