import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTestById, type Test, type MultipleChoiceQuestion, type TrueFalseQuestion } from '../services/api';

const TestDetailPage: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTest = async () => {
            if (!testId) return;
            try {
                const data = await getTestById(Number(testId));
                setTest(data);
                console.log(data);
            } catch (err) {
                setError('Failed to load test details.');
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, [testId]);

    if (loading) return <div className="container text-center mt-4">Loading...</div>;
    if (error) return <div className="container text-center mt-4" style={{ color: 'var(--error-color)' }}>{error}</div>;
    if (!test) return <div className="container text-center mt-4">Test not found.</div>;

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <button onClick={() => navigate('/dashboard')} className="btn mb-4" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
                ← Back to Dashboard
            </button>

            <div className="card mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>{test.testName}</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{test.testDescription}</p>
                        <div className="flex gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span>Subject: {test.subject?.name}</span>
                            <span>Section: {test.section?.name}</span>
                            <span>Duration: {test.testDuration / 60} mins</span>
                        </div>
                    </div>
                    {/* Placeholder for future Edit button */}
                </div>
            </div>

            <h2 className="mb-4">Questions ({test.questions?.length || 0})</h2>

            {test.questions && test.questions.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {test.questions.map((q) => (
                        <div key={q.id} className="card">
                            <div className="flex justify-between mb-2">
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Question {q.questionNumber}</h3>
                                <span className="badge" style={{ backgroundColor: 'var(--background-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                                    {q.questionType.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="mb-4" style={{ fontSize: '1rem' }}>{q.questionText}</p>

                            {q.questionType === 'MULTIPLE_CHOICE' && (
                                <div className="pl-4 border-l-2 border-gray-200">
                                    <p className="text-sm font-semibold mb-2">Options:</p>
                                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                                        {(q as MultipleChoiceQuestion).options?.map((opt, i) => (
                                            <li key={i} style={{
                                                color: (q as MultipleChoiceQuestion).correctAnswer === opt ? 'var(--success-color)' : 'inherit',
                                                fontWeight: (q as MultipleChoiceQuestion).correctAnswer === opt ? 'bold' : 'normal'
                                            }}>
                                                {opt} {(q as MultipleChoiceQuestion).correctAnswer === opt && '(Correct)'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {q.questionType === 'TRUE_FALSE' && (
                                <div className="pl-4 border-l-2 border-gray-200">
                                    <p>Correct Answer: <span style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>{(q as TrueFalseQuestion).trueFalseAnswer}</span></p>
                                </div>
                            )}

                            <div className="mt-4 text-right text-sm text-gray-500">
                                Points: {q.fullPoints}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 card" style={{ color: 'var(--text-secondary)' }}>
                    No questions added yet.
                </div>
            )}
        </div>
    );
};

export default TestDetailPage;
