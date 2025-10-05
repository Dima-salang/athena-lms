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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

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
            setError('Failed to register user.');
        }
    };

    return (
        <div>
            <h2>Register New User</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleRegister}>
                <div>
                    <label>First Name:</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div>
                    <label>Last Name:</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
                <div>
                    <label>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div>
                    <label>User Type:</label>
                    <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                    </select>
                </div>
                {userType === 'student' && (
                    <>
                        <div>
                            <label>LRN:</label>
                            <input type="number" value={lrn} onChange={(e) => setLrn(Number(e.target.value))} required />
                        </div>
                        <div>
                            <label>Section:</label>
                            <input type="text" value={sectionName} onChange={(e) => setSectionName(e.target.value)} required />
                        </div>
                    </>
                )}
                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default RegistrationPage;
