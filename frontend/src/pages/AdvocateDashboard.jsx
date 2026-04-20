import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { 
    TrendingDown, Users, DollarSign, Download, AlertTriangle, 
    Tag, Share2, Layers, CheckCircle, FileText, Search, 
    MapPin, ShieldAlert, Trash2, ExternalLink, Activity, Info
} from 'lucide-react';
import axios from 'axios';
import { LanguageContext } from '../context/LanguageContext';

const PIE_COLORS = ['#6870fa', '#3da58a', '#f59e0b', '#ef4444'];

export default function AdvocateDashboard() {
  const { user } = useContext(AuthContext);
  const { t, lang } = useContext(LanguageContext);
  const [grievances, setGrievances] = useState([]);
  const [vulnerabilityFlags, setVulnerabilityFlags] = useState([]);
  const [stats, setStats] = useState({ totalVolume: 0, totalCommission: 0, openGrievances: 0 });
  const [loading, setLoading] = useState(true);

  // Worker Research State
  const [searchId, setSearchId] = useState('');
  const [researchedWorker, setResearchedWorker] = useState(null);
  const [workerHistory, setWorkerHistory] = useState([]);
  const [workerAnomaly, setWorkerAnomaly] = useState(null);

  useEffect(() => {
    fetchAdvocateData();
  }, []);

  async function fetchAdvocateData() {
    setLoading(true);
    const { data: gData } = await supabase.from('grievances').select('*').order('created_at', { ascending: false });
    if (gData) setGrievances(gData);

    const { data: eData } = await supabase.from('earnings').select('*');
    if (eData) {
        const total = eData.reduce((acc, curr) => acc + parseFloat(curr.net_received), 0);
        const comm = eData.reduce((acc, curr) => acc + parseFloat(curr.platform_deductions), 0);
        
        const workerGroups = eData.reduce((acc, curr) => {
            acc[curr.worker_id] = (acc[curr.worker_id] || 0) + parseFloat(curr.net_received);
            return acc;
        }, {});
        
        const flagged = Object.keys(workerGroups)
            .filter(id => workerGroups[id] < 2000)
            .map(id => ({ id, name: `Worker-${id.substring(0,6)}`, drop: '24%' }));
        
        setVulnerabilityFlags(flagged);
        setStats({ 
            totalVolume: total, 
            totalCommission: comm, 
            openGrievances: gData?.filter(g => g.status === 'open').length || 0 
        });
    }
    setLoading(false);
  }

  const handleSearchWorker = async () => {
    if (!searchId) return;
    
    // 1. Find user by email first
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', searchId)
        .eq('role', 'worker')
        .single();

    if (userError || !userData) {
        alert("Worker email not found.");
        return;
    }

    const workerId = userData.id;

    // 2. Fetch history
    const { data: history } = await supabase
        .from('earnings')
        .select('*')
        .eq('worker_id', workerId)
        .order('shift_date', { ascending: false });
    
    setWorkerHistory(history || []);
    setResearchedWorker(userData);
    setWorkerAnomaly(null);
  };

  const runAnomalyForWorker = async () => {
    if (!researchedWorker) return;
    try {
        const res = await axios.post('http://localhost:8000/api/anomaly/detect', {
            worker_id: researchedWorker.id,
            recent_earnings: workerHistory.slice(0, 5)
        });
        setWorkerAnomaly(res.data);
    } catch (err) {
        alert("Anomaly Detection service unreachable.");
    }
  };

  const handleResolveGrievance = async (id, status) => {
    await supabase.from('grievances').update({ status }).eq('id', id);
    fetchAdvocateData();
  };

  const handleTagGrievance = async (id, currentTags) => {
    const newTag = prompt("Enter tag name for clustering (e.g. #SystemicUnderpayment):");
    if (newTag) {
        const updatedTags = [...(currentTags || []), newTag];
        await supabase.from('grievances').update({ tags: updatedTags }).eq('id', id);
        fetchAdvocateData();
    }
  };

  const generateCert = (workerId) => {
    window.open(`http://localhost:4003/api/certificates/generate/${workerId}`, '_blank');
  };

  const downloadGlobalReport = async () => {
    const { data: eData } = await supabase.from('earnings').select('*');
    const { data: gData } = await supabase.from('grievances').select('*');

    const reportRows = [
        ['Type', 'Date', 'WorkerID', 'Platform', 'Metric/Category', 'Amount/Description', 'Status'],
        ...(eData || []).map(e => ['Earning', e.shift_date, e.worker_id, e.platform, 'Net Income', e.net_received, e.status]),
        ...(gData || []).map(g => ['Grievance', g.created_at, g.worker_id, g.platform, g.category, g.description, g.status])
    ];

    let csvContent = "data:text/csv;charset=utf-8," + reportRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fairgig_global_research_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <header className="dashboard-header">
        <div>
          <h1 className="header-title">{t.advocate.title}</h1>
          <p className="header-subtitle">{t.advocate.subtitle}</p>
        </div>
        <button className="btn-download" onClick={downloadGlobalReport} style={{ background: 'white', border: '1px solid #ddd', color: 'var(--text-primary)' }}>
            <Download size={16} /> {t.common.download}
        </button>
      </header>

      <div className="grid-top-row">
        <div className="stat-box">
            <div className="stat-left">
                <ShieldAlert color="#ef4444" size={24} />
                <span className="stat-value">{vulnerabilityFlags.length}</span>
                <span className="stat-label">{t.advocate.stats_vulnerability}</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <TrendingDown color="var(--accent-teal)" size={24} />
                <span className="stat-value">Rs. {stats.totalCommission.toLocaleString()}</span>
                <span className="stat-label">{t.advocate.stats_extraction}</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <Layers color="#f59e0b" size={24} />
                <span className="stat-value">{stats.openGrievances}</span>
                <span className="stat-label">{lang === 'ur' ? 'شکایات کے گروپ' : 'Grievance Clusters'}</span>
            </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="chart-box">
            <h3 className="chart-title">{t.advocate.chart_commission}</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                        { name: 'W1', Uber: 18, Panda: 22 },
                        { name: 'W2', Uber: 20, Panda: 25 },
                        { name: 'W3', Uber: 25, Panda: 28 },
                        { name: 'W4', Uber: 24, Panda: 27 },
                    ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                        <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="Uber" stroke="#6870fa" fill="#6870fa33" />
                        <Area type="monotone" dataKey="Panda" stroke="#3da58a" fill="#3da58a33" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="chart-box">
            <h3 className="chart-title">{t.advocate.chart_zones}</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={[{name:'C',v:4500},{name:'E',v:3200},{name:'W',v:2800}]} innerRadius={50} outerRadius={70} dataKey="v">
                            {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* WORKER RESEARCH HUB: HISTORY & ANOMALY */}
      <div className="chart-box" style={{ marginBottom: '1.5rem', background: 'var(--accent-blue-light)', border: '1px solid var(--accent-blue)' }}>
        <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={18} /> {t.advocate.research_hub}
        </h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <input 
                type="text" 
                className="auth-input" 
                style={{ marginBottom: 0, flex: 1 }} 
                placeholder={t.advocate.search_placeholder} 
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
            />
            <button onClick={handleSearchWorker} className="auth-btn" style={{ width: 'auto', padding: '0 2rem' }}>{t.advocate.inspect_btn}</button>
        </div>

        {researchedWorker && (
            <div className="animate-fade-in" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontWeight: 'bold' }}>Earnings History: {researchedWorker.email}</h4>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button onClick={runAnomalyForWorker} className="btn-download" style={{ background: 'var(--accent-teal)' }}>
                            <Activity size={14} /> AI Anomaly Audit
                        </button>
                        <button onClick={() => generateCert(researchedWorker.id)} className="btn-download" style={{ background: 'var(--accent-blue)' }}>
                            <FileText size={14} /> Generate Support Cert
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t.common.date}</th>
                                    <th>{t.common.platform}</th>
                                    <th>{lang === 'ur' ? 'خالص' : 'Net'}</th>
                                    <th>{t.common.status}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workerHistory.map(h => (
                                    <tr key={h.id}>
                                        <td style={{ fontSize: '0.75rem' }}>{h.shift_date}</td>
                                        <td>{h.platform}</td>
                                        <td style={{ fontWeight: 'bold' }}>Rs. {h.net_received}</td>
                                        <td><span className={`badge ${h.status === 'verified' ? 'badge-success' : 'badge-warning'}`}>{h.status}</span></td>
                                    </tr>
                                ))}
                                {workerHistory.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No history found for this ID.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={14} color="var(--accent-blue)" /> AI AUDIT RESULTS
                        </h5>
                        {workerAnomaly ? (
                            <div className="animate-fade-in">
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{workerAnomaly.human_readable_explanation}</p>
                                <div style={{ marginTop: '1rem', fontSize: '0.75rem', fontWeight: 'bold', color: workerAnomaly.is_anomaly ? '#ef4444' : 'var(--accent-teal)' }}>
                                    RESULT: {workerAnomaly.is_anomaly ? 'SUSPICIOUS PATTERN' : 'NORMAL BEHAVIOR'}
                                </div>
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                                Click 'AI Anomaly Audit' to analyze this worker's systemic patterns.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="chart-box">
            <h3 className="chart-title">Systemic Vulnerability Flags</h3>
            <div style={{ padding: '0.5rem' }}>
                {vulnerabilityFlags.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', background: '#fff1f2', borderRadius: '8px', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Worker {f.id.substring(0,8)}</span>
                        <span style={{ fontSize: '0.7rem', color: '#e11d48' }}>Drop: {f.drop}</span>
                        <button onClick={() => {setSearchId(f.id); handleSearchWorker();}} className="btn-download" style={{ padding: '0.2rem 0.5rem', fontSize: '0.6rem' }}>Research</button>
                    </div>
                ))}
            </div>
        </div>

        <div className="chart-box">
            <h3 className="chart-title">Grievance Cluster Hub</h3>
            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Issue</th>
                            <th>Tags</th>
                            <th>Status</th>
                            <th>Resolve</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grievances.map(g => (
                            <tr key={g.id}>
                                <td style={{ fontSize: '0.75rem' }}>{g.category}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.2rem' }}>
                                        {g.tags?.map((t, i) => <span key={i} style={{ fontSize: '0.55rem', background: 'var(--accent-blue-light)', padding: '0 0.3rem', borderRadius: '4px' }}>{t}</span>)}
                                        <button onClick={() => handleTagGrievance(g.id, g.tags)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Tag size={10} /></button>
                                    </div>
                                </td>
                                <td><span className={`badge ${g.status === 'resolved' ? 'badge-success' : 'badge-neutral'}`}>{g.status}</span></td>
                                <td>
                                    <button onClick={() => handleResolveGrievance(g.id, 'resolved')} style={{ background: 'none', border: 'none', color: 'var(--accent-teal)', cursor: 'pointer' }}>
                                        <CheckCircle size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
