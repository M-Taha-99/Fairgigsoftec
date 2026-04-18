import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, XCircle, Search, HelpCircle, UserCheck, AlertCircle, Clock, BarChart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PIE_COLORS = ['#3da58a', '#f59e0b', '#ef4444'];

export default function VerifierDashboard() {
  const { user } = useContext(AuthContext);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ verified: 0, disputed: 0, pending: 0 });

  useEffect(() => {
    async function fetchData() {
      const { data: allEarnings } = await supabase.from('earnings').select('status');
      
      const counts = { verified: 0, disputed: 0, pending: 0 };
      if (allEarnings && allEarnings.length > 0) {
        allEarnings.forEach(e => {
            if (e.status === 'verified') counts.verified++;
            else if (e.status === 'disputed') counts.disputed++;
            else counts.pending++;
        });
      } else {
        // Mock data for demo if database is empty
        counts.verified = 45;
        counts.disputed = 12;
        counts.pending = 5;
      }
      setStats(counts);

      const { data: pendingData } = await supabase
        .from('earnings')
        .select(`
          id, platform, shift_date, gross_earned, net_received, screenshot_url, status,
          users ( email )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingData) setPending(pendingData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleAction = async (id, status) => {
    await supabase.from('earnings').update({ status }).eq('id', id);
    setPending(pending.filter(item => item.id !== id));
    setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        [status]: prev[status] + 1
    }));
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
          <p className="header-subtitle">Quality assurance & shift verification queue</p>
        </div>
      </div>

      <div className="grid-top-row">
        <div className="stat-box">
            <div className="stat-left">
                <Clock color="var(--accent-teal)" size={24} />
                <span className="stat-value">{stats.pending}</span>
                <span className="stat-label">Pending Review</span>
            </div>
            <div className="stat-right">
                <div className="progress-circle" style={{ borderColor: 'var(--accent-blue)' }}></div>
                <span className="stat-percent">Live</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <UserCheck color="var(--accent-teal)" size={24} />
                <span className="stat-value">{stats.verified}</span>
                <span className="stat-label">Total Verified</span>
            </div>
            <div className="stat-right">
                <div className="progress-circle" style={{ borderColor: 'var(--accent-green)' }}></div>
                <span className="stat-percent">Success</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <AlertCircle color="#ef4444" size={24} />
                <span className="stat-value">{stats.disputed}</span>
                <span className="stat-label">Disputed Shifts</span>
            </div>
            <div className="stat-right">
                <div className="progress-circle" style={{ borderColor: '#ef4444' }}></div>
                <span className="stat-percent">Action</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <BarChart color="var(--accent-teal)" size={24} />
                <span className="stat-value">{(stats.verified + stats.disputed + stats.pending)}</span>
                <span className="stat-label">Total Volume</span>
            </div>
            <div className="stat-right">
                <div className="progress-circle"></div>
                <span className="stat-percent">All Time</span>
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
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="chart-box" style={{ overflowY: 'auto', maxHeight: '400px' }}>
            <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Pending Verification Queue</h3>
            {loading ? (
                <p>Loading...</p>
            ) : pending.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <CheckCircle size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p>All verifications completed!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pending.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '4px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold' }}>{item.users?.email}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--accent-teal)' }}>{item.platform} • {item.shift_date}</div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs. {item.net_received}</div>
                                {item.screenshot_url && (
                                    <a href={item.screenshot_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                                        <Search size={10}/> View Proof
                                    </a>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleAction(item.id, 'verified')} style={{ background: 'rgba(61, 165, 138, 0.2)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}>
                                    <CheckCircle size={16} />
                                </button>
                                <button onClick={() => handleAction(item.id, 'disputed')} style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}>
                                    <XCircle size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
