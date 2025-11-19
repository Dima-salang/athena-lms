import React, { useState, useEffect } from 'react';
import { getTeacherTests, createTest, type Test } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authApi';

const DashboardPage: React.FC = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [teacherId, setTeacherId] = useState<number>(1);
    const [newTestName, setNewTestName] = useState('');
    const [newTestDescription, setNewTestDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const fetchTests = async () => {
        try {
            const teacherTests = await getTeacherTests(teacherId);
            if (Array.isArray(teacherTests)) {
                setTests(teacherTests);
            } else {
                setTests([]);
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch tests. Please check the teacher ID and try again.');
            setTests([]);
        }
    };

    useEffect(() => {
        fetchTests();
    }, [teacherId]);

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const newTest: Omit<Test, 'id'> = {
                testName: newTestName,
                testDescription: newTestDescription,
                testIssueDate: new Date().toISOString(),
                testDueDate: new Date().toISOString(),
                testDuration: 3600, // 1 hour in seconds
                section: { id: 1, name: 'Dummy Section' },
                subject: { id: 1, name: 'Dummy Subject', description: 'Dummy Subject Description' },
                questions: [],
            };
            await createTest(newTest);
            setNewTestName('');
            setNewTestDescription('');
            fetchTests(); // Refresh the list of tests
        } catch (err) {
            setError('Failed to create test.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1>Teacher Dashboard</h1>
                <button onClick={handleLogout} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>Logout</button>
            </div>

            {error && (
                <div style={{ backgroundColor: '#FEF2F2', color: 'var(--error-color)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #FECACA' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div>
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Create New Test</h2>
                        <form onSubmit={handleCreateTest}>
                            <div className="input-group">
                                <label>Test Name</label>
                                <input
                                    type="text"
                                    value={newTestName}
                                    onChange={(e) => setNewTestName(e.target.value)}
                                    required
                                    placeholder="e.g. Midterm Exam"
                                />
                            </div>
                            <div className="input-group">
                                <label>Description</label>
                                <textarea
                                    value={newTestDescription}
                                    onChange={(e) => setNewTestDescription(e.target.value)}
                                    required
                                    placeholder="Brief description of the test..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        minHeight: '100px',
                                        fontFamily: 'inherit',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating...' : 'Create Test'}
                            </button>
                        </form>
                    </div>
                </div>

                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Available Tests</h2>
                    {tests.length === 0 ? (
                        <div className="card text-center" style={{ padding: '3rem', color: 'var(--text-secondary)' }}>
                            <p>No tests found. Create one to get started.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {tests.map((test) => (
                                <div key={test.id} className="card" style={{ padding: '1.5rem' }}>
                                    <div className="flex justify-between items-center">
                                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{test.testName}</h3>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', backgroundColor: 'var(--background-color)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                            {test.subject.name}
                                        </span>
                                    </div>
                                    <p style={{ margin: '0.5rem 0 1rem 0', color: 'var(--text-secondary)' }}>{test.testDescription}</p>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <strong>Section:</strong> {test.section.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
