import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { 
    ShieldCheck, Clock, AlertTriangle, CheckCircle, 
    ArrowRight, BarChart2, Activity, TrendingUp, Download
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const PIE_COLORS = ['#3da58a', '#f59e0b', '#ef4444'];

const STATUS_COLORS = {
    verified: 'var(--accent-teal)',
    disputed: '#f59e0b',
    unverifiable: '#ef4444'
};

export default function VerifierDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pending: 0, verified: 0, disputed: 0, unverifiable: 0 });
  const [recentAudits, setRecentAudits] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [workerMap, setWorkerMap] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
        // 1. Fetch earnings
        const { data: allEarnings, error } = await supabase
            .from('earnings')
            .select('*');

        // 2. Fetch users to map IDs to emails (Safe alternative to joins)
        const { data: userData } = await supabase
            .from('users')
            .select('id, email');

        if (userData) {
            const map = {};
            userData.forEach(u => map[u.id] = u.email);
            setWorkerMap(map);
        }

        if (error) {
            console.error("Fetch Error:", error.message);
            return;
        }

        if (allEarnings) {
            const pending = allEarnings.filter(e => e.status === 'pending').length;
            const verified = allEarnings.filter(e => e.status === 'verified').length;
            const disputed = allEarnings.filter(e => e.status === 'disputed').length;
            const unverifiable = allEarnings.filter(e => e.status === 'unverifiable').length;

            setStats({ pending, verified, disputed, unverifiable });

            setChartData([
                { name: 'Verified', value: verified },
                { name: 'Disputed', value: disputed },
                { name: 'Unverifiable', value: unverifiable }
            ]);

            // For history, we'll map the IDs for now
            const sorted = allEarnings
                .filter(e => e.status !== 'pending' && e.verifier_id === user.id)
                .sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            setRecentAudits(sorted);
        }
    } catch (err) {
        console.error("Dashboard Load Error:", err);
    }
  }

  const downloadAuditReport = () => {
    // Export all audited items (anything not pending)
    const reportData = [
        ['Date', 'Worker', 'Platform', 'Amount', 'Status', 'Verifier Note'],
        ...recentAudits.map(a => [
            new Date(a.updated_at).toLocaleDateString(),
            a.users?.email,
            a.platform,
            a.net_received,
            a.status,
            a.verifier_note || ''
        ])
    ];

    let csvContent = "data:text/csv;charset=utf-8," + reportData.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="animate-fade-in">
      <header className="dashboard-header">
        <div>
          <h1 className="header-title">Verifier Overview</h1>
          <p className="header-subtitle">Monitoring digital labor integrity and trust protocols.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-download" onClick={downloadAuditReport} style={{ background: 'white', border: '1px solid #ddd', color: 'var(--text-primary)' }}>
                <Download size={16} /> Download Audit Report
            </button>
            <button className="auth-btn" onClick={() => navigate('/verifier/queue')} style={{ width: 'auto', padding: '0.8rem 1.5rem' }}>
                <Activity size={18} /> Open Verification Queue
            </button>
        </div>
      </header>

      <div className="grid-top-row">
        <div className="stat-box">
            <div className="stat-left">
                <Clock color="var(--accent-blue)" size={24} />
                <span className="stat-value">{stats.pending}</span>
                <span className="stat-label">Pending Review</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <CheckCircle color="var(--accent-green)" size={24} />
                <span className="stat-value">{stats.verified}</span>
                <span className="stat-label">Total Verified</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <AlertTriangle color="#f59e0b" size={24} />
                <span className="stat-value">{stats.disputed}</span>
                <span className="stat-label">Flagged Issues</span>
            </div>
        </div>
      </div>

      <div className="grid-middle-row" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        <div className="chart-box">
            <h3 className="chart-title">System-wide Verification Integrity</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                        <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                        <Tooltip contentStyle={{ background: 'white', borderRadius: '8px' }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase()]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="chart-box">
            <h3 className="chart-title">Status Distribution</h3>
            <div className="chart-container" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'white', borderRadius: '8px' }} />
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
                    {chartData.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                            <div style={{ width: '8px', height: '8px', background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: '50%' }}></div>
                            <span>{d.name}: {d.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="grid-bottom-row" style={{ gridTemplateColumns: '1fr' }}>
        <div className="chart-box">
            <h3 className="chart-title">Your Personal Audit History</h3>
            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Worker</th>
                            <th>Platform</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Verifier Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentAudits.map(audit => (
                            <tr key={audit.id}>
                                <td style={{ fontSize: '0.75rem' }}>{audit.shift_date || new Date(audit.created_at).toLocaleDateString()}</td>
                                <td style={{ fontWeight: '600' }}>{workerMap[audit.worker_id] || audit.worker_id.substring(0,8)}</td>
                                <td>{audit.platform}</td>
                                <td>Rs. {audit.net_received}</td>
                                <td>
                                    <span className={`badge ${audit.status === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                                        {audit.status}
                                    </span>
                                </td>
                                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{audit.verifier_note || 'No note provided'}</td>
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
