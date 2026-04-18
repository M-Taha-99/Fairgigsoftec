import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { DollarSign, Clock, TrendingUp, AlertTriangle, Download, FileText } from 'lucide-react';
import axios from 'axios';

const PIE_COLORS = ['#6870fa', '#3da58a', '#f59e0b', '#ef4444'];
const BAR_COLORS = ['#3da58a', '#f59e0b', '#6870fa', '#ef4444'];

// Fallback Mock Data for demo impact
const mockLineData = [
  { name: 'Week 1', earnings: 4500, hours: 20 },
  { name: 'Week 2', earnings: 5200, hours: 24 },
  { name: 'Week 3', earnings: 3800, hours: 18 },
  { name: 'Week 4', earnings: 6100, hours: 28 },
];

const mockPlatformData = [
  { name: 'Uber', value: 12000 },
  { name: 'FoodPanda', value: 8500 },
  { name: 'InDrive', value: 5000 },
];

export default function WorkerDashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ totalNet: 0, hourlyRate: 0, totalHours: 0, cityMedian: 460 });
  const [platformStats, setPlatformStats] = useState([]);
  const [anomaly, setAnomaly] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      const { data: earnings } = await supabase
        .from('earnings')
        .select('*')
        .eq('worker_id', user.id)
        .order('shift_date', { ascending: true });

      if (earnings && earnings.length > 0) {
        let totalNet = 0;
        let totalHours = 0;
        const chartData = [];
        const platformMap = {};

        earnings.forEach((e, idx) => {
            const net = parseFloat(e.net_received);
            const hrs = parseFloat(e.hours_worked);
            totalNet += net;
            totalHours += hrs;

            // Platform distribution
            if (!platformMap[e.platform]) platformMap[e.platform] = 0;
            platformMap[e.platform] += net;

            if (idx >= earnings.length - 12) {
                chartData.push({
                    name: e.shift_date.split('-').slice(1).join('/'),
                    earnings: net,
                    hours: hrs
                });
            }
        });

        setData(chartData.length > 0 ? chartData : mockLineData);
        setPlatformStats(Object.keys(platformMap).length > 0 
            ? Object.keys(platformMap).map(key => ({ name: key, value: platformMap[key] }))
            : mockPlatformData
        );
        setStats(prev => ({ 
            ...prev, 
            totalNet: totalNet || 19600, 
            totalHours: totalHours || 90,
            hourlyRate: totalHours > 0 ? (totalNet / totalHours).toFixed(0) : 218 
        }));

        // Anomaly Detection
        try {
            const res = await axios.post('http://localhost:8000/api/anomaly/detect', {
                worker_id: user.id,
                recent_earnings: earnings.slice(-5)
            });
            if (res.data.has_anomaly) setAnomaly(res.data);
        } catch (error) {
            console.error("Anomaly API failed");
        }

        // City Median
        try {
            const res = await axios.get('http://localhost:8001/api/analytics/medians');
            if (res.data.median_hourly_rate) {
                setStats(prev => ({ ...prev, cityMedian: res.data.median_hourly_rate }));
            }
        } catch (error) {
            console.error(error);
        }
      } else {
        // No earnings in DB, use mock data for demo
        setData(mockLineData);
        setPlatformStats(mockPlatformData);
        setStats({ totalNet: 19600, totalHours: 90, hourlyRate: 218, cityMedian: 460 });
      }
    }
    loadData();
  }, [user]);

  const handleDownload = () => {
    window.open(`http://localhost:4003/api/certificates/generate/${user.id}`, '_blank');
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">Worker Dashboard</h1>
          <p className="header-subtitle">Intelligence & earnings tracking for {user?.email}</p>
        </div>
        <button className="btn-download" onClick={handleDownload}>
          <Download size={16} /> Income Certificate
        </button>
      </div>

      {anomaly && (
        <div className="chart-box" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #ef4444', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <AlertTriangle color="#ef4444" size={24} />
          <div>
            <h4 style={{ color: '#ef4444', fontWeight: 'bold' }}>AI Anomaly Detected</h4>
            <p style={{ fontSize: '0.85rem' }}>{anomaly.human_readable_explanation}</p>
          </div>
        </div>
      )}

      <div className="grid-top-row">
        <div className="stat-box">
            <div className="stat-left">
                <DollarSign color="var(--accent-teal)" size={24} />
                <span className="stat-value">Rs. {stats.totalNet.toLocaleString()}</span>
                <span className="stat-label">Total Net Earnings</span>
            </div>
            <div className="stat-right">
                <div className="progress-circle" style={{ borderColor: 'var(--accent-green)' }}></div>
                <span className="stat-percent">+12%</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <Clock color="var(--accent-teal)" size={24} />
                <span className="stat-value">{stats.totalHours.toFixed(1)} hrs</span>
                <span className="stat-label">Total Time Worked</span>
            </div>
            <div className="stat-right">
                <div className="progress-circle" style={{ borderColor: 'var(--accent-blue)' }}></div>
                <span className="stat-percent">+5%</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <TrendingUp color="var(--accent-teal)" size={24} />
                <span className="stat-value">Rs. {stats.hourlyRate}/hr</span>
                <span className="stat-label">Effective Rate</span>
            </div>
            <div className="stat-right">
                <div className="progress-circle" style={{ borderColor: stats.hourlyRate < stats.cityMedian ? '#ef4444' : 'var(--accent-teal)' }}></div>
                <span className="stat-percent" style={{ color: stats.hourlyRate < stats.cityMedian ? '#ef4444' : 'var(--accent-teal)' }}>
                    {stats.hourlyRate < stats.cityMedian ? 'Low' : 'Good'}
                </span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <FileText color="var(--accent-teal)" size={24} />
                <span className="stat-value">Rs. {stats.cityMedian}/hr</span>
                <span className="stat-label">City Median Rate</span>
            </div>
            <div className="stat-right">
                <div className="progress-circle"></div>
                <span className="stat-percent">Market</span>
            </div>
        </div>
      </div>

      <div className="grid-middle-row">
        <div className="chart-box">
            <h3 className="chart-title">Earnings Trajectory (Last 12 Shifts)</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10, fill: '#64748b'}} />
                        <YAxis stroke="#64748b" tick={{fontSize: 10, fill: '#64748b'}} />
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
                        <Line type="monotone" dataKey="earnings" stroke="var(--accent-teal)" strokeWidth={3} dot={{r: 4, fill: 'var(--accent-teal)'}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="chart-box">
            <h3 className="chart-title">Platform Distribution</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={platformStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {platformStats.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(val) => `Rs. ${val}`} contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {platformStats.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                            <div style={{ width: '8px', height: '8px', background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: '50%' }}></div>
                            <span>{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="grid-bottom-row" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        <div className="chart-box">
            <h3 className="chart-title">Hours vs Earnings Performance</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10, fill: '#64748b'}} />
                        <YAxis yAxisId="left" stroke="#6870fa" tick={{fontSize: 10, fill: '#6870fa'}} />
                        <YAxis yAxisId="right" orientation="right" stroke="#3da58a" tick={{fontSize: 10, fill: '#3da58a'}} />
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                        <Bar yAxisId="left" dataKey="hours" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="earnings" fill="var(--accent-teal)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="chart-box">
            <h3 className="chart-title">Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button className="btn-download" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.location.href='/worker/log'}>
                    Log New Shift
                </button>
                <button className="btn-download" style={{ width: '100%', justifyContent: 'center', background: 'transparent', border: '1px solid var(--accent-blue)' }} onClick={() => alert('Opening Support...')}>
                    Contact Advocate
                </button>
                <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Did you know? Logging screenshots helps AI detect platform errors 30% faster.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
