import React, { useState } from 'react';
import { login } from '../services/authApi';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const data = await login({ username, password });
            if (data) {
                // Session based auth, no token to store
                // You might want to store the role if needed for UI logic
                if (data.role) {
                    localStorage.setItem('role', data.role);
                }
                // print
                console.log(data);
                navigate('/dashboard');
            } else {
                setError('Login failed');
            }
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;
