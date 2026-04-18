import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { 
    TrendingDown, Users, DollarSign, Download, AlertTriangle, 
    Tag, Share2, Layers, CheckCircle, FileText, Search 
} from 'lucide-react';
import axios from 'axios';
import { supabase } from '../lib/supabase';

const PIE_COLORS = ['#6870fa', '#3da58a', '#f59e0b', '#ef4444'];
const BAR_COLORS = ['#3da58a', '#f59e0b', '#6870fa', '#ef4444', '#70d8bd'];

export default function AdvocateDashboard() {
  const { user } = useContext(AuthContext);
  const [grievances, setGrievances] = useState([]);
  const [vulnerableWorkers, setVulnerableWorkers] = useState([]);
  const [stats, setStats] = useState({ totalVolume: 0, totalCommission: 0, shiftCount: 0 });
  const [loading, setLoading] = useState(true);
  const [filterEmail, setFilterEmail] = useState('');

  useEffect(() => {
    fetchAdvocateData();
  }, []);

  async function fetchAdvocateData() {
    // Fetch all grievances
    const { data: gData } = await supabase.from('grievances').select('*').order('created_at', { ascending: false });
    if (gData) setGrievances(gData);

    // Fetch all earnings for systemic analysis
    const { data: eData } = await supabase.from('earnings').select('*');
    if (eData) {
        const total = eData.reduce((acc, curr) => acc + parseFloat(curr.net_received), 0);
        const comm = eData.reduce((acc, curr) => acc + parseFloat(curr.platform_deductions), 0);
        setStats({ totalVolume: total, totalCommission: comm, shiftCount: eData.length });

        // Simple Vulnerability Logic: Check for workers with low recent earnings vs average
        // (In a real app, this would be a complex time-series query)
        const workerGroups = eData.reduce((acc, curr) => {
            acc[curr.worker_id] = (acc[curr.worker_id] || 0) + parseFloat(curr.net_received);
            return acc;
        }, {});
        
        const vulnerable = Object.keys(workerGroups).filter(id => workerGroups[id] < 1000).slice(0, 5);
        setVulnerableWorkers(vulnerable);
    }
    setLoading(false);
  }

  const handleResolveGrievance = async (id, status) => {
    await supabase.from('grievances').update({ status }).eq('id', id);
    fetchAdvocateData();
  };

  const handleTagGrievance = async (id, currentTags) => {
    const newTag = prompt("Enter tag name (e.g. #Underpayment, #Safety):");
    if (newTag) {
        const updatedTags = [...(currentTags || []), newTag];
        await supabase.from('grievances').update({ tags: updatedTags }).eq('id', id);
        fetchAdvocateData();
    }
  };

  const generateCertForWorker = (workerId) => {
      window.open(`http://localhost:4003/api/certificates/generate/${workerId}`, '_blank');
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">Advocate Intelligence Panel</h1>
          <p className="header-subtitle">Systemic oversight, vulnerability tracking, and grievance resolution</p>
        </div>
      </div>

      <div className="grid-top-row">
        <div className="stat-box">
            <div className="stat-left">
                <Users color="var(--accent-blue)" size={24} />
                <span className="stat-value">{vulnerableWorkers.length}</span>
                <span className="stat-label">Vulnerability Flags</span>
            </div>
            <div className="stat-right">
                <AlertTriangle color="#ef4444" size={16} />
                <span className="stat-percent">Active</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <TrendingDown color="var(--accent-teal)" size={24} />
                <span className="stat-value">Rs. {stats.totalCommission.toLocaleString()}</span>
                <span className="stat-label">Total Platform Fees</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <DollarSign color="var(--accent-blue)" size={24} />
                <span className="stat-value">Rs. {stats.totalVolume.toLocaleString()}</span>
                <span className="stat-label">Systemic Net Volume</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <Layers color="var(--accent-teal)" size={24} />
                <span className="stat-value">{grievances.filter(g => g.status === 'open').length}</span>
                <span className="stat-label">Unresolved Issues</span>
            </div>
        </div>
      </div>

      <div className="grid-middle-row" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="chart-box">
            <h3 className="chart-title">Systemic Commission Rate Trends</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                        { name: 'Jan', Uber: 18, FoodPanda: 22, InDrive: 15 },
                        { name: 'Feb', Uber: 20, FoodPanda: 22, InDrive: 15 },
                        { name: 'Mar', Uber: 22, FoodPanda: 25, InDrive: 18 },
                        { name: 'Apr', Uber: 25, FoodPanda: 28, InDrive: 18 },
                    ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                        <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Rate %', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: 'white', borderRadius: '8px' }} />
                        <Legend iconType="circle" />
                        <Line type="monotone" dataKey="Uber" stroke="#6870fa" strokeWidth={3} />
                        <Line type="monotone" dataKey="FoodPanda" stroke="#3da58a" strokeWidth={3} />
                        <Line type="monotone" dataKey="InDrive" stroke="#ef4444" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="chart-box">
            <h3 className="chart-title">Income Distribution (By Zone)</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={[
                            {name: 'Zone A', value: 4500},
                            {name: 'Zone B', value: 3200},
                            {name: 'Zone C', value: 2800},
                            {name: 'Zone D', value: 1500}
                        ]} innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                            {PIE_COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'white', borderRadius: '8px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="chart-box" style={{ marginTop: '2rem' }}>
        <h3 className="chart-title" style={{ marginBottom: '1.5rem' }}>Full Grievance & Worker Resolution Hub</h3>
        <div className="data-table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Worker ID</th>
                        <th>Grievance</th>
                        <th>Tags / Clusters</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {grievances.map(g => (
                        <tr key={g.id}>
                            <td>
                                <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>USR-{g.worker_id.substring(0,6)}</div>
                                <button onClick={() => generateCertForWorker(g.worker_id)} style={{ fontSize: '0.65rem', color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    <FileText size={10} /> Generate Cert
                                </button>
                            </td>
                            <td>
                                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{g.platform} - {g.category}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.description}</div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                    {g.tags?.map((t, i) => (
                                        <span key={i} style={{ fontSize: '0.6rem', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{t}</span>
                                    ))}
                                    <button onClick={() => handleTagGrievance(g.id, g.tags)} style={{ fontSize: '0.6rem', color: 'var(--accent-teal)', border: 'none', background: 'none', cursor: 'pointer' }}>
                                        <Tag size={10} /> Add Tag
                                    </button>
                                </div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <button onClick={() => alert('Opening evidence vault... Screenshots linked to worker history.')} style={{ fontSize: '0.65rem', color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        <Search size={10} /> View Evidence Vault
                                    </button>
                                </div>
                            </td>
                            <td>
                                <span className={`badge ${g.status === 'resolved' ? 'badge-success' : g.status === 'escalated' ? 'badge-warning' : 'badge-neutral'}`}>
                                    {g.status}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleResolveGrievance(g.id, 'resolved')} className="btn-download" style={{ padding: '0.3rem', background: 'var(--accent-teal)' }} title="Resolve">
                                        <CheckCircle size={14} />
                                    </button>
                                    <button onClick={() => handleResolveGrievance(g.id, 'escalated')} className="btn-download" style={{ padding: '0.3rem', background: '#f59e0b' }} title="Escalate">
                                        <Share2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
