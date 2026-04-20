import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const { t, lang, setLang } = useContext(LanguageContext);
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        <Globe size={14} /> {lang === 'en' ? 'Urdu' : 'English'}
                    </button>
                </div>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>{t.auth.login_title}</h2>
                <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.auth.login_sub}</p>
                {successMessage && <p style={{ color: 'var(--accent-teal)', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>{successMessage}</p>}
                {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', fontSize: '0.8rem' }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder={t.auth.email} 
                        className="auth-input" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder={t.auth.password} 
                        className="auth-input" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                    />
                    <button type="submit" className="auth-btn">{t.auth.login_btn}</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {t.auth.no_acc} <Link to="/register" style={{ color: 'var(--accent-teal)' }}>{lang === 'ur' ? 'یہاں رجسٹر کریں' : 'Register here'}</Link>
                </p>
            </div>
        </div>
    );
}
