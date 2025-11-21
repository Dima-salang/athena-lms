import React, { useState, useEffect, useRef } from 'react';
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
    const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
    const autosaveTimerRef = useRef<number | null>(null);
    const navigate = useNavigate();

    // Autosave logic
    useEffect(() => {
        if (testId && questions.length > 0) {
            if (autosaveTimerRef.current) {
                clearTimeout(autosaveTimerRef.current);
            }
            autosaveTimerRef.current = window.setTimeout(() => {
                handleAutosave();
            }, 3 * 60 * 1000); // 3 minutes
        }
        return () => {
            if (autosaveTimerRef.current) {
                clearTimeout(autosaveTimerRef.current);
            }
        };
    }, [questions, testId, testName, testDescription, subjectName, sectionName]);

    const handleAutosave = async () => {
        if (!testId) return;
        setIsSaving(true);
        try {
            // Prepare questions: strip temp IDs (negative)
            const questionsToSave = questions.map(q => {
                const { id, ...rest } = q;
                return id < 0 ? rest : q;
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

            // Update local state with saved questions (which now have real IDs)
            if (savedTest.questions) {
                setQuestions(savedTest.questions);
            }
            setLastSavedTime(new Date());
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
        const newQuestion: MultipleChoiceQuestion = {
            id: -Date.now(), // Use negative timestamp for temporary ID to avoid collision
            test: { id: testId! } as Test,
            questionNumber: (questions.length + 1).toString(),
            questionText: '',
            questionType: 'MULTIPLE_CHOICE',
            fullPoints: 1,
            correctPoints: 1,
            options: ['', '', '', ''],
            questionAnswer: '',
            correctAnswer: ''
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (updatedQuestion: Question) => {
        setQuestions(questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
    };

    const deleteQuestion = (id: number) => {
        setQuestions(questions.filter(q => q.id !== id));
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
