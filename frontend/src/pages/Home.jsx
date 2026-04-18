import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f6f8fd 0%, #f1f5f9 100%)',
            color: '#334155',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'var(--font-body)'
        }}>
            {/* Navbar */}
            <header style={{
                padding: '1.5rem 4rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-blue)', margin: 0, letterSpacing: '-0.5px' }}>
                    FairGig
                </h1>
                <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link to="/login" style={{ color: '#475569', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--accent-blue)'} onMouseOut={e => e.target.style.color = '#475569'}>Log In</Link>
                    <Link to="/register" style={{
                        background: 'var(--accent-blue)',
                        color: 'white',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        boxShadow: '0 4px 14px 0 rgba(104, 112, 250, 0.39)',
                        transition: 'transform 0.2s'
                    }} onMouseOver={e => e.target.style.transform = 'translateY(-2px)'} onMouseOut={e => e.target.style.transform = 'translateY(0)'}>
                        Sign Up Free
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
                <div style={{ maxWidth: '800px', textAlign: 'center', animation: 'fadeInUp 0.8s ease-out forwards' }}>
                    
                    <div style={{
                        display: 'inline-block',
                        background: 'rgba(104, 112, 250, 0.1)',
                        color: 'var(--accent-blue)',
                        padding: '0.4rem 1rem',
                        borderRadius: '20px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        marginBottom: '1.5rem'
                    }}>
                        ✨ The Future of Gig Worker Rights
                    </div>

                    <h2 style={{
                        fontSize: '4rem',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        color: '#0f172a',
                        letterSpacing: '-1px'
                    }}>
                        Empowering <span style={{ color: 'var(--accent-teal)' }}>Gig Workers</span> through Data.
                    </h2>
                    
                    <p style={{
                        fontSize: '1.2rem',
                        color: '#64748b',
                        marginBottom: '2.5rem',
                        lineHeight: 1.6,
                        maxWidth: '600px',
                        margin: '0 auto 2.5rem'
                    }}>
                        Log your shifts, detect unfair algorithmic deductions with AI, and unite with advocates to ensure fair pay across all delivery and ride-sharing platforms.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/register" style={{
                            background: 'var(--accent-blue)',
                            color: 'white',
                            padding: '1rem 2rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            boxShadow: '0 4px 14px 0 rgba(104, 112, 250, 0.39)',
                            transition: 'transform 0.2s',
                        }} onMouseOver={e => e.target.style.transform = 'scale(1.05)'} onMouseOut={e => e.target.style.transform = 'scale(1)'}>
                            Get Started
                        </Link>
                        <Link to="/login" style={{
                            background: 'white',
                            color: '#0f172a',
                            border: '1px solid #cbd5e1',
                            padding: '1rem 2rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            transition: 'all 0.2s'
                        }} onMouseOver={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#94a3b8'; }} onMouseOut={e => { e.target.style.background = 'white'; e.target.style.borderColor = '#cbd5e1'; }}>
                            Access Dashboard
                        </Link>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
