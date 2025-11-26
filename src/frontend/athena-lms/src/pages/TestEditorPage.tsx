import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTestById, type Test, type Question, type MultipleChoiceQuestion, createOrUpdateQuestions } from '../services/api';
import QuestionEditor from '../components/QuestionEditor';

const TestEditorPage: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

    useEffect(() => {
        if (testId) {
            fetchTest(Number(testId));
        }
    }, [testId]);

    const fetchTest = async (id: number) => {
        try {
            const fetchedTest = await getTestById(id);
            setTest(fetchedTest);
            if (fetchedTest.questions) {
                // Initialize questions with isDirty: false
                setQuestions(fetchedTest.questions.map(q => ({ ...q, isDirty: false })));
            }
        } catch (error) {
            console.error("Failed to fetch test", error);
        }
    };

    // Autosave logic with debounce
    useEffect(() => {
        if (testId && isDirty) {
            const timer = setTimeout(() => {
                handleAutosave();
            }, 2000); // 2 seconds debounce

            return () => clearTimeout(timer);
        }
    }, [questions, testId, isDirty]);

    const handleAutosave = async () => {
        if (!testId || !isDirty) return;
        setIsSaving(true);
        try {
            // Filter only dirty questions
            const questionsToSave = questions.filter(q => q.isDirty).map(q => {
                // Ensure tempId is set if missing (for older questions potentially)
                const tempId = q.tempId || (q.id < 0 ? q.id : undefined);
                return { ...q, tempId };
            });

            if (questionsToSave.length === 0) {
                setIsDirty(false);
                setIsSaving(false);
                return;
            }

            const response = await createOrUpdateQuestions(questionsToSave, Number(testId));
            const savedQuestions = response as Question[];

            // Update local state: match by tempId or id
            setQuestions(prevQuestions => {
                const newQuestions = [...prevQuestions];
                const savedQuestionsMap = new Map<number, Question>();
                savedQuestions.forEach(q => {
                    if (q.tempId) savedQuestionsMap.set(q.tempId, q);
                    else savedQuestionsMap.set(q.id, q);
                });

                return newQuestions.map(localQ => {
                    // If this question was dirty and saved, update it
                    if (localQ.isDirty) {
                        let savedQ: Question | undefined;
                        if (localQ.tempId && savedQuestionsMap.has(localQ.tempId)) {
                            savedQ = savedQuestionsMap.get(localQ.tempId);
                        } else if (localQ.id > 0 && savedQuestionsMap.has(localQ.id)) {
                            savedQ = savedQuestionsMap.get(localQ.id);
                        }

                        if (savedQ) {
                            const newQ = { ...localQ, id: savedQ.id, isDirty: false }; // Reset isDirty

                            if (localQ.questionType === 'MULTIPLE_CHOICE') {
                                const mcQuestion = localQ as MultipleChoiceQuestion;
                                const savedMcQuestion = savedQ as MultipleChoiceQuestion;
                                let updatedOptions: any[] | undefined = undefined;

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

                                    // Update correctOptionId if it was a tempId
                                    const newMcQ = newQ as MultipleChoiceQuestion;
                                    if (newMcQ.correctOptionId && newMcQ.correctOptionId < 0) {
                                        if (savedOptionsMap.has(newMcQ.correctOptionId)) {
                                            newMcQ.correctOptionId = savedOptionsMap.get(newMcQ.correctOptionId).id;
                                        }
                                    }
                                }

                                if (updatedOptions) {
                                    (newQ as MultipleChoiceQuestion).options = updatedOptions;
                                }
                            }
                            return newQ;
                        }
                    }
                    return localQ;
                });
            });

            setLastSavedTime(new Date());
            setIsDirty(false);
        } catch (error) {
            console.error("Autosave failed", error);
        } finally {
            setIsSaving(false);
        }
    };

    const addQuestion = () => {
        const tempId = -Date.now();
        const newQuestion: MultipleChoiceQuestion = {
            id: tempId,
            tempId: tempId,
            test: { id: Number(testId) } as Test,
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
            correctAnswer: '',
            isDirty: true // Mark as dirty
        };
        setQuestions([...questions, newQuestion]);
        setIsDirty(true);
    };

    const updateQuestion = (updatedQuestion: Question) => {
        setQuestions(questions.map(q => q.id === updatedQuestion.id ? { ...updatedQuestion, isDirty: true } : q));
        setIsDirty(true);
    };

    const deleteQuestion = (id: number) => {
        if (id > 0) {
            deleteQuestion(id);
        }
        setQuestions(questions.filter(q => q.id !== id));
    };

    const saveQuestion = async () => {
        handleAutosave();
    };

    if (!test) return <div>Loading...</div>;

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <div className="flex justify-between items-center mb-4">
                <h1>Editing: {test.testName}</h1>
                <div className="text-right">
                    {isSaving && <span style={{ color: 'var(--text-secondary)', marginRight: '1rem' }}>Saving...</span>}
                    {lastSavedTime && <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Last saved: {lastSavedTime.toLocaleTimeString()}</span>}
                </div>
            </div>

            <div className="mb-4">
                {questions.map((q) => (
                    <QuestionEditor
                        key={q.id || q.tempId}
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
    );
};

export default TestEditorPage;
