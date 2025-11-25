import React, { useState, useEffect } from 'react';
import { getSections, createSection, type Section } from '../services/api';
import { useNavigate } from 'react-router-dom';

const SectionManagementPage: React.FC = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [newSectionName, setNewSectionName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const fetchedSections = await getSections();
            setSections(fetchedSections);
        } catch (err) {
            setError('Failed to fetch sections');
        }
    };

    const handleCreateSection = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createSection({ name: newSectionName });
            setNewSectionName('');
            setSuccess('Section created successfully');
            fetchData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to create section');
            setTimeout(() => setError(null), 3000);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <div className="flex justify-between items-center mb-6">
                <h1>Manage Sections</h1>
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
                <h2>Add New Section</h2>
                <form onSubmit={handleCreateSection} className="mb-4">
                    <div className="input-group">
                        <label>Section Name</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                required
                                placeholder="e.g. Grade 10 - Newton"
                                style={{ flex: 1 }}
                            />
                            <button type="submit" className="btn btn-primary">Add</button>
                        </div>
                    </div>
                </form>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem' }}>ID</th>
                                <th style={{ padding: '0.5rem' }}>Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sections.map(section => (
                                <tr key={section.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.5rem' }}>{section.id}</td>
                                    <td style={{ padding: '0.5rem' }}>{section.name}</td>
                                </tr>
                            ))}
                            {sections.length === 0 && (
                                <tr>
                                    <td colSpan={2} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No sections found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SectionManagementPage;
