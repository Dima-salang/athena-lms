import React, { useState, useEffect } from 'react';
import { createTest, type Test, type Question, type MultipleChoiceQuestion } from '../services/api';
import QuestionEditor from '../components/QuestionEditor';
import { useNavigate } from 'react-router-dom';

const CreateTestPage: React.FC = () => {
    const [testName, setTestName] = useState('');
    const [testDescription, setTestDescription] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [sectionName, setSectionName] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [testId, setTestId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
    const navigate = useNavigate();

    // Autosave logic
    // Autosave logic with debounce
    useEffect(() => {
        if (testId && isDirty) {
            const timer = setTimeout(() => {
                handleAutosave();
            }, 3000); // 2 seconds debounce

            return () => clearTimeout(timer);
        }
    }, [questions, testId, testName, testDescription, subjectName, sectionName, isDirty]);

    const handleAutosave = async () => {
        if (!testId || !isDirty) return;
        setIsSaving(true);
        try {
            // Snapshot of questions being saved
            // We send the tempId so the backend can persist it and return it for matching
            const questionsToSave = questions.map(q => {
                // Ensure tempId is set if missing (for older questions potentially)
                const tempId = q.tempId || (q.id < 0 ? q.id : undefined);
                return { ...q, tempId };
            });

            const testToSave: Omit<Test, 'teacher'> = {
                id: testId,
                testName,
                testDescription,
                testIssueDate: new Date().toISOString(),
                testDueDate: new Date().toISOString(),
                testDuration: 3600,
                section: { id: 0, name: sectionName },
                subject: { id: 0, name: subjectName, description: '' },
                questions: questionsToSave as Question[]
            };

            const savedTest = await createTest(testToSave);

            // Update local state: match by tempId
            if (savedTest.questions) {
                setQuestions(prevQuestions => {
                    const newQuestions = [...prevQuestions];

                    // Create maps for fast lookup
                    const savedQuestionsMap = new Map<number, Question>();
                    savedTest.questions.forEach(q => {
                        if (q.tempId) savedQuestionsMap.set(q.tempId, q);
                    });

                    return newQuestions.map(localQ => {
                        // Match by tempId
                        if (localQ.tempId && savedQuestionsMap.has(localQ.tempId)) {
                            const savedQ = savedQuestionsMap.get(localQ.tempId)!;

                            // Update options if applicable
                            let updatedOptions: any[] | undefined = undefined;
                            if (localQ.questionType === 'MULTIPLE_CHOICE') {
                                const mcQuestion = localQ as MultipleChoiceQuestion;
                                const savedMcQuestion = savedQ as MultipleChoiceQuestion;

                                if (mcQuestion.options && savedMcQuestion.options) {
                                    const savedOptionsMap = new Map<number, any>();
                                    savedMcQuestion.options.forEach((o: any) => {
                                        if (o.tempId) savedOptionsMap.set(o.tempId, o);
                                    });

                                    updatedOptions = mcQuestion.options.map(localO => {
                                        if (localO.tempId && savedOptionsMap.has(localO.tempId)) {
                                            return { ...localO, id: savedOptionsMap.get(localO.tempId).id };
                                        }
                                        return localO;
                                    });
                                }
                            }

                            const newQ = { ...localQ, id: savedQ.id };
                            if (updatedOptions) {
                                (newQ as MultipleChoiceQuestion).options = updatedOptions;
                            }
                            return newQ;
                        }
                        return localQ;
                    });
                });
            }
            setLastSavedTime(new Date());
            setIsDirty(false);
        } catch (error) {
            console.error("Autosave failed", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const newTest: Omit<Test, 'id' | 'teacher'> = {
                testName,
                testDescription,
                testIssueDate: new Date().toISOString(),
                testDueDate: new Date().toISOString(),
                testDuration: 3600,
                section: { id: 0, name: sectionName },
                subject: { id: 0, name: subjectName, description: '' },
                questions: []
            };
            const createdTest = await createTest(newTest);
            setTestId(createdTest.id);
        } catch (error) {
            console.error("Failed to create test", error);
        } finally {
            setIsSaving(false);
        }
    };

    const addQuestion = () => {
        const tempId = -Date.now();
        const newQuestion: MultipleChoiceQuestion = {
            id: tempId,
            tempId: tempId,
            test: { id: testId! } as Test,
            questionNumber: (questions.length + 1).toString(),
            questionText: '',
            questionType: 'MULTIPLE_CHOICE',
            fullPoints: 1,
            correctPoints: 1,
            options: [
                { optionText: '', tempId: tempId - 1 },
                { optionText: '', tempId: tempId - 2 },
                { optionText: '', tempId: tempId - 3 },
                { optionText: '', tempId: tempId - 4 }
            ],
            questionAnswer: '',
            correctAnswer: ''
        };
        setQuestions([...questions, newQuestion]);
        setIsDirty(true);
    };

    const updateQuestion = (updatedQuestion: Question) => {
        setQuestions(questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
        setIsDirty(true);
    };

    const deleteQuestion = (id: number) => {
        setQuestions(questions.filter(q => q.id !== id));
        setIsDirty(true);
    };

    const saveQuestion = async () => {
        // Manually saving a question now triggers a full test save to ensure consistency
        handleAutosave();
    };

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <div className="flex justify-between items-center mb-4">
                <h1>{testId ? `Editing: ${testName}` : 'Create New Test'}</h1>
                <div className="text-right">
                    {isSaving && <span style={{ color: 'var(--text-secondary)', marginRight: '1rem' }}>Saving...</span>}
                    {lastSavedTime && <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Last saved: {lastSavedTime.toLocaleTimeString()}</span>}
                </div>
            </div>

            {!testId ? (
                <div className="card">
                    <form onSubmit={handleCreateTest}>
                        <div className="input-group">
                            <label>Test Name</label>
                            <input type="text" value={testName} onChange={e => setTestName(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label>Description</label>
                            <textarea value={testDescription} onChange={e => setTestDescription(e.target.value)} required />
                        </div>
                        <div className="flex gap-4">
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>Subject</label>
                                <input type="text" value={subjectName} onChange={e => setSubjectName(e.target.value)} required />
                            </div>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>Section</label>
                                <input type="text" value={sectionName} onChange={e => setSectionName(e.target.value)} required />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={isSaving}>
                            {isSaving ? 'Creating...' : 'Start Adding Questions'}
                        </button>
                    </form>
                </div>
            ) : (
                <div>
                    <div className="mb-4">
                        {questions.map((q) => (
                            <QuestionEditor
                                key={q.id}
                                question={q}
                                onUpdate={updateQuestion}
                                onDelete={deleteQuestion}
                                onSave={() => saveQuestion()}
                            />
                        ))}
                    </div>
                    <button onClick={addQuestion} className="btn btn-primary btn-block">
                        + Add New Question
                    </button>
                    <div className="mt-4 text-center">
                        <button onClick={() => navigate('/dashboard')} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
                            Done & Return to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateTestPage;
