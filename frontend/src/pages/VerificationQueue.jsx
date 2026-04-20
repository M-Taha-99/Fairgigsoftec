import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { 
    CheckCircle, XCircle, AlertCircle, Eye, ZoomIn, 
    Search, History, TrendingDown, MessageSquare, ShieldCheck, 
    ArrowRight, Info, User, FileText
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';

export default function VerificationQueue() {
  const { user } = useContext(AuthContext);
  const { t, lang } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [workerHistory, setWorkerHistory] = useState([]);
  const [anomaly, setAnomaly] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [workerMap, setWorkerMap] = useState({});

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    setLoading(true);
    const { data, error } = await supabase
      .from('earnings')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    // Fetch users for mapping
    const { data: userData } = await supabase.from('users').select('id, email');
    if (userData) {
        const map = {};
        userData.forEach(u => map[u.id] = u.email);
        setWorkerMap(map);
    }
    
    if (error) {
        console.error("Queue Fetch Error:", error.message);
    }
    if (data) setQueue(data);
    setLoading(false);
  }

  const handleInspect = async (item) => {
    setSelectedItem(item);
    setNote(item.verifier_note || '');
    setAnomaly(null);
    
    // Fetch this worker's history to check patterns
    const { data: history } = await supabase
        .from('earnings')
        .select('*')
        .eq('worker_id', item.worker_id)
        .neq('id', item.id)
        .order('shift_date', { ascending: false })
        .limit(5);
    
    setWorkerHistory(history || []);
  };

  const runAnomalyAssist = async () => {
    if (!selectedItem) return;
    try {
        const res = await axios.post('http://localhost:8000/api/anomaly/detect', {
            worker_id: selectedItem.worker_id,
            recent_earnings: [selectedItem, ...workerHistory]
        });
        setAnomaly(res.data);
    } catch (err) {
        alert("Anomaly Detection service unreachable.");
    }
  };

  const handleAudit = async (status) => {
    if (!selectedItem) return;
    
    const { error } = await supabase
        .from('earnings')
        .update({ 
            status, 
            verifier_note: note,
            verifier_id: user.id 
        })
        .eq('id', selectedItem.id);

    if (!error) {
        setSelectedItem(null);
        fetchQueue();
    }
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/verifier')} className="nav-link" style={{ background: 'white', padding: '0.5rem', borderRadius: '50%' }}>
            <ArrowRight size={18} style={{ transform: lang === 'ur' ? 'none' : 'rotate(180deg)' }} />
          </button>
          <div>
            <h1 className="header-title">{t.verifier.audit_queue}</h1>
            <p className="header-subtitle">{lang === 'ur' ? `${queue.length} زیر التواء شفٹیں` : `Reviewing ${queue.length} pending shifts`}</p>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem', overflow: 'hidden' }}>
        
        {/* LEFT: Queue List */}
        <div className="chart-box" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee' }}>
                <h3 className="chart-title">{t.verifier.stats_pending}</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {queue.map(item => (
                    <div 
                        key={item.id} 
                        onClick={() => handleInspect(item)}
                        style={{ 
                            padding: '1rem 1.5rem', 
                            borderBottom: '1px solid #f1f5f9', 
                            cursor: 'pointer',
                            background: selectedItem?.id === item.id ? 'var(--accent-blue-light)' : 'transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{workerMap[item.worker_id] || 'Worker ' + item.worker_id.substring(0,6)}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.shift_date || new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem' }}>{item.platform} • {item.hours_worked} {lang === 'ur' ? 'گھنٹے' : 'hrs'}</span>
                            <span style={{ fontWeight: '700', color: 'var(--accent-teal)' }}>Rs. {item.net_received}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* RIGHT: Detailed Inspector */}
        <div className="chart-box" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {selectedItem ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 className="chart-title">{t.verifier.inspect_title}: {workerMap[selectedItem.worker_id] || selectedItem.worker_id}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.common.date}: {selectedItem.shift_date || 'N/A'}</p>
                        </div>
                        <button onClick={runAnomalyAssist} className="btn-download" style={{ background: 'var(--accent-teal)', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                            <Search size={14} /> {t.verifier.ai_assist}
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        
                        {/* Evidence Viewer */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{t.verifier.evidence}</h4>
                            <div style={{ flex: 1, minHeight: '300px', background: '#f1f5f9', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0' }}>
                                {selectedItem.evidence_url ? (
                                    selectedItem.evidence_url.includes('csv') ? (
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                            <FileText size={48} color="var(--accent-blue)" />
                                            <p style={{ marginTop: '1rem' }}>CSV Log Data</p>
                                            <a href={selectedItem.evidence_url} target="_blank" className="nav-link" style={{ color: 'var(--accent-blue)' }}>Download Source</a>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative', height: '100%' }}>
                                            <img src={selectedItem.evidence_url} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '4px', color: 'white' }}>
                                                <ZoomIn size={16} />
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>{lang === 'ur' ? 'کوئی ڈیجیٹل ثبوت نہیں ہے' : 'No digital evidence attached'}</div>
                                )}
                            </div>

                            {anomaly && (
                                <div style={{ padding: '1rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', color: '#d97706', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                                        <AlertCircle size={14} /> AI ANALYSIS
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#92400e' }}>{anomaly.human_readable_explanation}</p>
                                </div>
                            )}
                        </div>

                        {/* Audit Details & History */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent-blue)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={16} /> {t.verifier.audit_comp}
                                </h4>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ borderInlineEnd: '1px solid #e2e8f0', paddingInlineEnd: '1rem' }}>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t.verifier.worker_reported}</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                                <span>Gross:</span>
                                                <span style={{ fontWeight: 'bold' }}>Rs. {selectedItem.gross_earned}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                                <span>Fee:</span>
                                                <span style={{ fontWeight: 'bold' }}>Rs. {selectedItem.platform_deductions}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--accent-teal)', fontWeight: 'bold', paddingTop: '0.5rem', borderTop: '1px dashed #ccc' }}>
                                                <span>{lang === 'ur' ? 'خالص' : 'Net'}:</span>
                                                <span>Rs. {selectedItem.net_received}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t.verifier.verifier_obs}</p>
                                        <p style={{ fontSize: '0.65rem', color: '#64748b', fontStyle: 'italic' }}>{lang === 'ur' ? 'اسکرین شاٹ چیک کریں اور اعداد و شمار کی تصدیق کریں۔' : 'Check screenshot and confirm if figures match.'}</p>
                                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                                <input type="checkbox" id="gross_match" /> <label htmlFor="gross_match">{t.verifier.matches}</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>Worker History Patterns</h4>
                                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.5rem' }}>
                                    {workerHistory.map(h => (
                                        <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.4rem', borderBottom: '1px solid #eee' }}>
                                            <span>{h.shift_date}</span>
                                            <span>{h.platform}</span>
                                            <span style={{ fontWeight: 'bold' }}>Rs. {h.net_received}</span>
                                            <span style={{ color: h.status === 'verified' ? 'var(--accent-green)' : '#f59e0b' }}>{h.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{t.common.note}</label>
                                <textarea 
                                    className="auth-input" 
                                    style={{ marginTop: '0.5rem', resize: 'none' }} 
                                    rows="3" 
                                    placeholder={lang === 'ur' ? 'اپنا فیصلہ بیان کریں...' : 'Explain your decision...'}
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                ></textarea>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginTop: '1rem' }}>
                                    <button onClick={() => handleAudit('unverifiable')} className="btn-download" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid #ddd' }}>
                                        {t.verifier.unverifiable}
                                    </button>
                                    <button onClick={() => handleAudit('disputed')} className="btn-download" style={{ background: '#f59e0b' }}>
                                        {t.verifier.flag_btn}
                                    </button>
                                    <button onClick={() => handleAudit('verified')} className="btn-download" style={{ background: 'var(--accent-teal)' }}>
                                        <CheckCircle size={16} /> {t.verifier.verify_btn}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                    <Info size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>{lang === 'ur' ? 'معائنہ شروع کرنے کے لیے قطار سے ایک شفٹ منتخب کریں۔' : 'Select a shift from the queue to begin inspection.'}</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
