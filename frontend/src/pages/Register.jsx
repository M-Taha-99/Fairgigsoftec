import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('worker');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('http://localhost:4004/api/auth/register', { email, password });
            // Successfully registered, navigate to login
            navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>Create Account</h2>
                {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', fontSize: '0.8rem' }}>{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder="Email Address" 
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

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.2rem', textAlign: 'center' }}>
                        * New accounts are registered with the <strong>Worker</strong> role.
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Registering...' : 'Sign Up'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-teal)' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}
