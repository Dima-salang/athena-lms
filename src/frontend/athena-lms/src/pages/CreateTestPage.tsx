import React, { useState, useEffect } from 'react';
import { createTest, getSections, getSubjects, type Test, type Section, type Subject } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CreateTestPage: React.FC = () => {
    const [testName, setTestName] = useState('');
    const [testDescription, setTestDescription] = useState('');
    const [subjectId, setSubjectId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
    const [availableSections, setAvailableSections] = useState<Section[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [sections, subjects] = await Promise.all([getSections(), getSubjects()]);
                setAvailableSections(sections);
                setAvailableSubjects(subjects);
                // Set defaults if available
                if (sections.length > 0) setSectionId(sections[0].id);
                if (subjects.length > 0) setSubjectId(subjects[0].id);
            } catch (err) {
                console.error("Failed to fetch sections or subjects", err);
            }
        };
        fetchOptions();
    }, []);

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
                section: availableSections.find(s => s.id === sectionId) || { id: 0, name: '' },
                subject: availableSubjects.find(s => s.id === subjectId) || { id: 0, name: '', description: '' },
                questions: []
            };
            const createdTest = await createTest(newTest);
            // Redirect to the editor page
            navigate(`/test/${createdTest.id}/edit`);
        } catch (error) {
            console.error("Failed to create test", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <div className="flex justify-between items-center mb-4">
                <h1>Create New Test</h1>
            </div>

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
                            <select
                                value={subjectId || ''}
                                onChange={e => setSubjectId(Number(e.target.value))}
                                required
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            >
                                <option value="" disabled>Select Subject</option>
                                {availableSubjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                            <label>Section</label>
                            <select
                                value={sectionId || ''}
                                onChange={e => setSectionId(Number(e.target.value))}
                                required
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            >
                                <option value="" disabled>Select Section</option>
                                {availableSections.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={isSaving}>
                        {isSaving ? 'Creating...' : 'Create & Add Questions'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateTestPage;
