import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { useContext } from 'react';
import { Globe } from 'lucide-react';

export default function Register() {
    const { t, lang, setLang } = useContext(LanguageContext);
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        <Globe size={14} /> {lang === 'en' ? 'Urdu' : 'English'}
                    </button>
                </div>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>{t.auth.register_title}</h2>
                <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.auth.register_sub}</p>
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

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.2rem', textAlign: 'center' }}>
                        {lang === 'ur' ? '* نئے اکاؤنٹس "ورکر" کے طور پر رجسٹر ہوں گے۔' : '* New accounts are registered with the Worker role.'}
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? (lang === 'ur' ? 'رجسٹر ہو رہا ہے...' : 'Registering...') : (t.auth.register_btn)}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {t.auth.has_acc} <Link to="/login" style={{ color: 'var(--accent-teal)' }}>{lang === 'ur' ? 'لاگ ان کریں' : 'Sign In'}</Link>
                </p>
            </div>
        </div>
    );
}
