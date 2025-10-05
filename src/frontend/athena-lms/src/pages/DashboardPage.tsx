import React, { useState, useEffect } from 'react';
import { getTeacherTests, createTest, type Test } from '../services/api';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [teacherId, setTeacherId] = useState<number>(1);
    const [newTestName, setNewTestName] = useState('');
    const [newTestDescription, setNewTestDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
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

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newTest: Omit<Test, 'id'> = {
                testName: newTestName,
                testDescription: newTestDescription,
                testIssueDate: new Date().toISOString(),
                testDueDate: new Date().toISOString(),
                testDuration: 3600, // 1 hour in seconds
                section: { id: 1, name: 'Dummy Section' },
                teacher: { id: teacherId, firstName: 'Dummy', lastName: 'Teacher', username: 'dummyteacher' },
                subject: { id: 1, name: 'Dummy Subject', description: 'Dummy Subject Description' },
                questions: [],
            };
            await createTest(newTest);
            setNewTestName('');
            setNewTestDescription('');
            fetchTests(); // Refresh the list of tests
        } catch (err) {
            setError('Failed to create test.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
        fetchTests();
    }, [teacherId, navigate]);

    return (
        <div>
            <button onClick={handleLogout} style={{ float: 'right' }}>Logout</button>
            <h1>Test Dashboard</h1>
            <div>
                <label>
                    Teacher ID:
                    <input
                        type="number"
                        value={teacherId}
                        onChange={(e) => setTeacherId(Number(e.target.value))}
                    />
                </label>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h2>Create New Test</h2>
            <form onSubmit={handleCreateTest}>
                <div>
                    <label>
                        Name:
                        <input
                            type="text"
                            value={newTestName}
                            onChange={(e) => setNewTestName(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Description:
                        <textarea
                            value={newTestDescription}
                            onChange={(e) => setNewTestDescription(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <button type="submit">Create Test</button>
            </form>

            <h2>Available Tests</h2>
            <ul>
                {tests.map((test) => (
                    <li key={test.id}>
                        <h3>{test.testName}</h3>
                        <p>{test.testDescription}</p>
                        <p>Subject: {test.subject.name}</p>
                        <p>Section: {test.section.name}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DashboardPage;
