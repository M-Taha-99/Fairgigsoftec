import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, Send, Tag, AlertCircle, CheckCircle } from 'lucide-react';

export default function GrievanceBoard() {
  const { user } = useContext(AuthContext);
  const [grievances, setGrievances] = useState([]);
  const [newComplaint, setNewComplaint] = useState({ platform: 'Uber', category: 'Payment', description: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchGrievances();
  }, [user]);

  async function fetchGrievances() {
    if (!user) return;
    let query = supabase.from('grievances').select('*').order('created_at', { ascending: false });
    
    // Workers only see their own
    if (user.role === 'worker') {
        query = query.eq('worker_id', user.id);
    }

    const { data } = await query;
    if (data) setGrievances(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('grievances').insert([{
        worker_id: user.id,
        platform: newComplaint.platform,
        category: newComplaint.category,
        description: newComplaint.description,
        status: 'open'
    }]);

    if (!error) {
        setMsg('Grievance posted successfully. Advocates will review shortly.');
        setNewComplaint({ ...newComplaint, description: '' });
        fetchGrievances();
    }
    setLoading(false);
  };

  const handleStatusChange = async (id, status) => {
    await supabase.from('grievances').update({ status }).eq('id', id);
    fetchGrievances();
  };

  return (
    <div className="animate-fade-in">
        <header className="dashboard-header">
            <div>
                <h1 className="header-title">Grievance Board</h1>
                <p className="header-subtitle">Report platform issues and unite for fair treatment.</p>
            </div>
        </header>

        {msg && <div className="chart-box" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-green)', color: 'var(--accent-green)' }}>{msg}</div>}

        <div className="grid-middle-row" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
            <div className="chart-box">
                <h3 className="chart-title">Post a Complaint</h3>
                {user.role === 'worker' ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Platform</label>
                            <select className="auth-input" value={newComplaint.platform} onChange={e => setNewComplaint({...newComplaint, platform: e.target.value})}>
                                <option>Uber</option>
                                <option>FoodPanda</option>
                                <option>InDrive</option>
                                <option>Bykea</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Category</label>
                            <select className="auth-input" value={newComplaint.category} onChange={e => setNewComplaint({...newComplaint, category: e.target.value})}>
                                <option>Payment Dispute</option>
                                <option>Account Ban</option>
                                <option>Unfair Deduction</option>
                                <option>Safety Issue</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Description</label>
                            <textarea 
                                className="auth-input" 
                                rows="4" 
                                style={{ resize: 'none' }}
                                value={newComplaint.description}
                                onChange={e => setNewComplaint({...newComplaint, description: e.target.value})}
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="btn-download" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                            <Send size={16} /> {loading ? 'Posting...' : 'Post Complaint'}
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <AlertCircle size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>Only Workers can file new grievances.</p>
                        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Advocates manage and resolve existing complaints.</p>
                    </div>
                )}
            </div>

            <div className="chart-box" style={{ overflowY: 'auto', maxHeight: '600px' }}>
                <h3 className="chart-title">Recent Community Complaints</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {grievances.map(g => (
                        <div key={g.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Tag size={14} color="var(--accent-teal)" />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-teal)' }}>{g.category}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {g.platform}</span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(g.created_at).toLocaleDateString()}</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>{g.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {g.status === 'open' ? (
                                    <span style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Open</span>
                                ) : g.status === 'escalated' ? (
                                    <span style={{ fontSize: '0.7rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Escalated</span>
                                ) : (
                                    <span style={{ fontSize: '0.7rem', background: 'rgba(61,165,138,0.1)', color: 'var(--accent-green)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Resolved</span>
                                )}
                                </div>
                                {user.role === 'advocate' && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleStatusChange(g.id, 'resolved')} className="btn-download" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                                            Resolve
                                        </button>
                                        <button onClick={() => handleStatusChange(g.id, 'escalated')} className="btn-download" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: '#f59e0b' }}>
                                            Escalate
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}
