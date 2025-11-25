import React, { useState, useEffect } from 'react';
import { getSubjects, createSubject, type Subject } from '../services/api';
import { useNavigate } from 'react-router-dom';

const SubjectManagementPage: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectDescription, setNewSubjectDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const fetchedSubjects = await getSubjects();
            setSubjects(fetchedSubjects);
        } catch (err) {
            setError('Failed to fetch subjects');
        }
    };

    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createSubject({ name: newSubjectName, description: newSubjectDescription });
            setNewSubjectName('');
            setNewSubjectDescription('');
            setSuccess('Subject created successfully');
            fetchData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to create subject');
            setTimeout(() => setError(null), 3000);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <div className="flex justify-between items-center mb-6">
                <h1>Manage Subjects</h1>
                <button onClick={() => navigate('/admin')} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
                    Back to Admin Dashboard
                </button>
            </div>

            {error && (
                <div style={{ backgroundColor: '#FEF2F2', color: 'var(--error-color)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #FECACA' }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{ backgroundColor: '#F0FDF4', color: 'var(--success-color)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #BBF7D0' }}>
                    {success}
                </div>
            )}

            <div className="card mb-6">
                <h2>Add New Subject</h2>
                <form onSubmit={handleCreateSubject} className="mb-4">
                    <div className="input-group">
                        <label>Subject Name</label>
                        <input
                            type="text"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            required
                            placeholder="e.g. Mathematics"
                        />
                    </div>
                    <div className="input-group">
                        <label>Description</label>
                        <textarea
                            value={newSubjectDescription}
                            onChange={(e) => setNewSubjectDescription(e.target.value)}
                            required
                            placeholder="Subject description..."
                            rows={3}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Add Subject</button>
                </form>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem' }}>ID</th>
                                <th style={{ padding: '0.5rem' }}>Name</th>
                                <th style={{ padding: '0.5rem' }}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map(subject => (
                                <tr key={subject.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.5rem' }}>{subject.id}</td>
                                    <td style={{ padding: '0.5rem' }}>{subject.name}</td>
                                    <td style={{ padding: '0.5rem' }}>{subject.description}</td>
                                </tr>
                            ))}
                            {subjects.length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No subjects found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubjectManagementPage;
