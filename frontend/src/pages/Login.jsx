import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');
    const successMessage = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.role === 'worker') navigate('/worker');
            else if (user.role === 'verifier') navigate('/verifier');
            else if (user.role === 'advocate') navigate('/advocate');
            else if (user.role === 'admin') navigate('/admin');
            else setError(`Login success, but role "${user.role}" is unrecognized.`);
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error || 'Invalid credentials.');
            } else if (err.request) {
                setError('Cannot connect to Auth Service (Port 4004). Please ensure it is running.');
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>FairGig Login</h2>
                {successMessage && <p style={{ color: 'var(--accent-teal)', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>{successMessage}</p>}
                {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', fontSize: '0.8rem' }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder="Email (e.g. alex.worker@example.com)" 
                        className="auth-input" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="auth-input" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                    />
                    <button type="submit" className="auth-btn">Sign In</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent-teal)' }}>Register here</Link>
                </p>
            </div>
        </div>
    );
}
