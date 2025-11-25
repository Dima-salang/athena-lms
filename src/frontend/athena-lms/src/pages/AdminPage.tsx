import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="container" style={{ maxWidth: '1000px', margin: '2rem auto' }}>
            <div className="flex justify-between items-center mb-6">
                <h1>Admin Dashboard</h1>
                <button onClick={() => navigate('/dashboard')} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
                    Back to Dashboard
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="card" onClick={() => navigate('/admin/sections')} style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Manage Sections</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Create, view, and manage class sections.</p>
                </div>

                <div className="card" onClick={() => navigate('/admin/subjects')} style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Manage Subjects</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Create, view, and manage subjects and descriptions.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
