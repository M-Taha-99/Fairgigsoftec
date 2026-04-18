import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { 
    CheckCircle, XCircle, Search, UserCheck, AlertCircle, Clock, 
    BarChart, ZoomIn, FileText, Activity, X 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import axios from 'axios';

const PIE_COLORS = ['#3da58a', '#f59e0b', '#ef4444'];

export default function VerifierDashboard() {
  const { user } = useContext(AuthContext);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ verified: 0, disputed: 0, pending: 0 });
  const [selectedItem, setSelectedItem] = useState(null);
  const [verifierNote, setVerifierNote] = useState('');
  const [workerHistory, setWorkerHistory] = useState([]);
  const [anomalyResult, setAnomalyResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: allEarnings } = await supabase.from('earnings').select('status');
    
    const counts = { verified: 0, disputed: 0, pending: 0 };
    if (allEarnings && allEarnings.length > 0) {
      allEarnings.forEach(e => {
          if (e.status === 'verified') counts.verified++;
          else if (e.status === 'disputed' || e.status === 'unverifiable') counts.disputed++;
          else counts.pending++;
      });
    }
    setStats(counts);

    const { data: pendingData } = await supabase
      .from('earnings')
      .select(`
        id, worker_id, platform, shift_date, gross_earned, net_received, screenshot_url, evidence_url, status,
        users ( email )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (pendingData) setPending(pendingData);
    setLoading(false);
  }

  const handleAction = async (id, status) => {
    await supabase.from('earnings').update({ status, verifier_note: verifierNote }).eq('id', id);
    setPending(pending.filter(item => item.id !== id));
    setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        [status === 'disputed' || status === 'unverifiable' ? 'disputed' : status]: prev[status === 'disputed' || status === 'unverifiable' ? 'disputed' : status] + 1
    }));
    setSelectedItem(null);
    setVerifierNote('');
  };

  const inspectWorker = async (workerId) => {
    const { data } = await supabase.from('earnings').select('*').eq('worker_id', workerId).order('shift_date', { ascending: false });
    setWorkerHistory(data || []);
    
    // Run anomaly check
    try {
        const res = await axios.get(`http://localhost:8000/api/anomaly/check/${workerId}`);
        setAnomalyResult(res.data);
    } catch (err) {
        setAnomalyResult({ error: "Service unavailable" });
    }
  };

  const openInspector = (item) => {
    setSelectedItem(item);
    inspectWorker(item.worker_id);
    setShowModal(true);
  };

  const pieData = [
    { name: 'Verified', value: stats.verified },
    { name: 'Pending', value: stats.pending },
    { name: 'Disputed', value: stats.disputed }
  ];

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">Verifier Dashboard</h1>
          <p className="header-subtitle">Quality assurance & evidence verification queue</p>
        </div>
      </div>

      <div className="grid-top-row">
        <div className="stat-box">
            <div className="stat-left">
                <Clock color="var(--accent-teal)" size={24} />
                <span className="stat-value">{stats.pending}</span>
                <span className="stat-label">Pending</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <UserCheck color="var(--accent-teal)" size={24} />
                <span className="stat-value">{stats.verified}</span>
                <span className="stat-label">Verified</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <AlertCircle color="#ef4444" size={24} />
                <span className="stat-value">{stats.disputed}</span>
                <span className="stat-label">Disputed</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <BarChart color="var(--accent-teal)" size={24} />
                <span className="stat-value">{(stats.verified + stats.disputed + stats.pending)}</span>
                <span className="stat-label">Total Load</span>
            </div>
        </div>
      </div>

      <div className="grid-middle-row" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div className="chart-box">
            <h3 className="chart-title">Status Distribution</h3>
            <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '8px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="chart-box" style={{ overflowY: 'auto', maxHeight: '500px' }}>
            <h3 className="chart-title" style={{ marginBottom: '1.5rem' }}>Pending Verification Queue</h3>
            {loading ? <p>Loading...</p> : pending.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <CheckCircle size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p>Queue empty!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pending.map(item => (
                        <div key={item.id} className="stat-box" style={{ padding: '1rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold' }}>{item.users?.email}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--accent-teal)' }}>{item.platform} • {item.shift_date}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Rs. {item.net_received}</div>
                                <button onClick={() => openInspector(item)} className="nav-link" style={{ padding: '0.2rem 0', color: 'var(--accent-blue)', fontSize: '0.75rem' }}>
                                    <ZoomIn size={14} /> Inspect Evidence
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {showModal && selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', padding: '2rem' }}>
            <div style={{ background: 'white', flex: 1, borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}>
                    <X size={24} />
                </button>
                
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Left: Evidence & Notes */}
                    <div style={{ flex: 1, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Shift Evidence Check</h2>
                        <div style={{ flex: 1, background: '#f8fafc', borderRadius: '8px', overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                            {selectedItem.evidence_url ? (
                                selectedItem.evidence_url.includes('csv') ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <FileText size={48} color="var(--accent-blue)" style={{ marginBottom: '1rem' }} />
                                        <p style={{ fontSize: '0.8rem' }}>CSV Proof Attached</p>
                                        <a href={selectedItem.evidence_url} target="_blank" rel="noreferrer" className="nav-link" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
                                            Download Evidence File
                                        </a>
                                    </div>
                                ) : (
                                    <img src={selectedItem.evidence_url} alt="Proof" style={{ maxWidth: '100%', maxHeight: '100%', cursor: 'zoom-in' }} />
                                )
                            ) : selectedItem.screenshot_url ? (
                                <img src={selectedItem.screenshot_url} alt="Proof" style={{ maxWidth: '100%', maxHeight: '100%', cursor: 'zoom-in' }} />
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No digital evidence uploaded</div>
                            )}
                        </div>
                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Verifier Notes (Sent to worker if flagged)</label>
                            <textarea 
                                className="auth-input" 
                                style={{ marginTop: '0.5rem', height: '80px', resize: 'none' }}
                                placeholder="Explain any discrepancies found..."
                                value={verifierNote}
                                onChange={(e) => setVerifierNote(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button onClick={() => handleAction(selectedItem.id, 'verified')} className="auth-btn" style={{ background: 'var(--accent-teal)' }}>Verify Shift</button>
                                <button onClick={() => handleAction(selectedItem.id, 'disputed')} className="auth-btn" style={{ background: '#ef4444' }}>Flag Discrepancy</button>
                                <button onClick={() => handleAction(selectedItem.id, 'unverifiable')} className="auth-btn" style={{ background: '#64748b' }}>Unverifiable</button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Patterns & Anomaly */}
                    <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                        <h3>Worker Patterns</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Review past shifts to spot unusual reporting behavior.</p>
                        
                        {anomalyResult && !anomalyResult.error && (
                            <div style={{ background: 'rgba(104, 112, 250, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--accent-blue)', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    <Activity size={16} /> AI Anomaly Result
                                </div>
                                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{anomalyResult.message}</p>
                            </div>
                        )}

                        <div className="data-table-container">
                            <table className="data-table" style={{ fontSize: '0.8rem' }}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Platform</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workerHistory.map(h => (
                                        <tr key={h.id}>
                                            <td>{h.shift_date}</td>
                                            <td>{h.platform}</td>
                                            <td>Rs. {h.net_received}</td>
                                            <td><span className={`badge ${h.status === 'verified' ? 'badge-success' : 'badge-neutral'}`}>{h.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
