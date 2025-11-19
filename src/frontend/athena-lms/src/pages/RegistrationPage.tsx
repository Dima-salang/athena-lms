import React, { useState } from 'react';
import { registerStudent, registerTeacher } from '../services/authApi';
import type { Student, Teacher } from '../services/api';
import { Link } from 'react-router-dom';

const RegistrationPage: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('student');
    const [lrn, setLrn] = useState(0);
    const [sectionName, setSectionName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            if (userType === 'student') {
                const student: Omit<Student, 'id'> = {
                    firstName,
                    lastName,
                    username,
                    password,
                    lrn,
                    section: { id: 1, name: sectionName }, // Dummy section id
                };
                await registerStudent(student);
                setSuccess('Student registered successfully!');
            } else {
                const teacher: Omit<Teacher, 'id'> = {
                    firstName,
                    lastName,
                    username,
                    password,
                };
                await registerTeacher(teacher);
                setSuccess('Teacher registered successfully!');
            }
        } catch (err) {
            setError('Failed to register user. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
            <div className="card">
                <h2 className="text-center mb-4">Create Account</h2>

                {error && (
                    <div style={{ backgroundColor: '#FEF2F2', color: 'var(--error-color)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #FECACA' }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ backgroundColor: '#ECFDF5', color: 'var(--success-color)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #A7F3D0' }}>
                        {success}
                        <div className="mt-4">
                            <Link to="/login" className="btn btn-primary btn-block" style={{ textDecoration: 'none' }}>Proceed to Login</Link>
                        </div>
                    </div>
                )}

                {!success && (
                    <form onSubmit={handleRegister}>
                        <div className="input-group">
                            <label>I am a:</label>
                            <select
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    placeholder="John"
                                />
                            </div>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="johndoe"
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        {userType === 'student' && (
                            <>
                                <div className="input-group">
                                    <label>LRN (Learner Reference Number)</label>
                                    <input
                                        type="number"
                                        value={lrn || ''}
                                        onChange={(e) => setLrn(Number(e.target.value))}
                                        required
                                        placeholder="123456789012"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Section</label>
                                    <input
                                        type="text"
                                        value={sectionName}
                                        onChange={(e) => setSectionName(e.target.value)}
                                        required
                                        placeholder="Grade 10 - Newton"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </button>

                        <p className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
                            Already have an account? <Link to="/login">Login here</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RegistrationPage;
