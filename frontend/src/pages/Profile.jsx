import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const { t, lang } = useContext(LanguageContext);

  if (!user) return null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div className="chart-box" style={{ padding: '3rem', textAlign: 'center' }}>
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
          alt="Avatar" 
          style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '1.5rem', border: '4px solid var(--accent-blue)' }} 
        />
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{user.email.split('@')[0].toUpperCase()}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{lang === 'ur' ? 'ممبر بننے کی تاریخ' : 'Member since'} {new Date(user.created_at || Date.now()).toLocaleDateString()}</p>

        <div style={{ textAlign: 'start', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Mail size={20} color="var(--accent-blue)" />
            <div style={{ textAlign: 'start' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.auth.email}</div>
              <div style={{ fontWeight: '600' }}>{user.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={20} color="var(--accent-teal)" />
            <div style={{ textAlign: 'start' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.auth.role}</div>
              <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Calendar size={20} color="var(--accent-blue)" />
            <div style={{ textAlign: 'start' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lang === 'ur' ? 'اکاؤنٹ کی حیثیت' : 'Account Status'}</div>
              <div style={{ fontWeight: '600', color: 'var(--accent-green)' }}>{lang === 'ur' ? 'فعال اور بہتر حالت میں' : 'Active & In Good Standing'}</div>
            </div>
          </div>
        </div>

        <button 
          onClick={logout} 
          style={{ marginTop: '2rem', width: '100%', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <LogOut size={18} /> {t.nav.logout}
        </button>
      </div>
    </div>
  );
}
