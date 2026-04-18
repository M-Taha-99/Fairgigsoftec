import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { 
    Users, UserPlus, Trash2, Shield, DollarSign, Activity, 
    AlertTriangle, Download, FileText, TrendingUp, BarChart2 
} from 'lucide-react';
import axios from 'axios';
import { supabase } from '../lib/supabase';

const PIE_COLORS = ['#6870fa', '#3da58a', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'worker' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchGlobalData();
  }, []);

  async function fetchGlobalData() {
    setLoading(true);
    // Fetch all users
    const { data: userData } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    // Fetch all earnings for system-wide stats
    const { data: earningData } = await supabase.from('earnings').select('*');
    
    if (userData) setUsers(userData);
    if (earningData) setEarnings(earningData);
    setLoading(false);
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMsg('Creating user...');
    try {
        const token = localStorage.getItem('accessToken');
        await axios.post('http://localhost:4004/api/auth/admin/create-user', newUser, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setMsg('User created successfully!');
        setNewUser({ email: '', password: '', role: 'worker' });
        fetchGlobalData();
    } catch (err) {
        setMsg('Error: ' + (err.response?.data?.error || 'Failed to create user'));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`http://localhost:4004/api/auth/admin/delete-user/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setMsg('User deleted successfully');
        fetchGlobalData();
    } catch (err) {
        setMsg('Error: ' + (err.response?.data?.error || 'Failed to delete user'));
    }
  };

  // Aggregated Stats
  const totalSystemEarnings = earnings.reduce((acc, curr) => acc + parseFloat(curr.net_received), 0);
  const platformData = earnings.reduce((acc, curr) => {
      acc[curr.platform] = (acc[curr.platform] || 0) + parseFloat(curr.net_received);
      return acc;
  }, {});

  const pieData = [
    { name: 'Workers', value: users.filter(u => u.role === 'worker').length },
    { name: 'Verifiers', value: users.filter(u => u.role === 'verifier').length },
    { name: 'Advocates', value: users.filter(u => u.role === 'advocate').length },
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length },
  ].filter(d => d.value > 0);

  const barData = Object.keys(platformData).map(key => ({ name: key, revenue: platformData[key] }));

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">Super Admin Command Center</h1>
          <p className="header-subtitle">Full system oversight, user management, and global performance tracking.</p>
        </div>
      </div>

      {msg && <div className="chart-box" style={{ marginBottom: '1.5rem', minHeight: 'auto', borderLeft: '4px solid var(--accent-blue)', color: 'var(--accent-blue)' }}>{msg}</div>}

      <div className="grid-top-row">
        <div className="stat-box">
            <div className="stat-left">
                <DollarSign color="var(--accent-blue)" size={24} />
                <span className="stat-value">Rs. {totalSystemEarnings.toLocaleString()}</span>
                <span className="stat-label">Global Net Volume</span>
            </div>
            <div className="stat-right">
                <TrendingUp color="var(--accent-green)" size={16} />
                <span className="stat-percent">+24%</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <Activity color="var(--accent-teal)" size={24} />
                <span className="stat-value">{earnings.length}</span>
                <span className="stat-label">Total Shifts Logged</span>
            </div>
            <div className="stat-right">
                <BarChart2 color="var(--accent-blue)" size={16} />
                <span className="stat-percent">+12%</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <Users color="var(--accent-blue)" size={24} />
                <span className="stat-value">{users.length}</span>
                <span className="stat-label">System Users</span>
            </div>
            <div className="stat-right">
                <Shield color="var(--accent-teal)" size={16} />
                <span className="stat-percent">Live</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <AlertTriangle color="#ef4444" size={24} />
                <span className="stat-value">{users.filter(u => u.role === 'verifier').length}</span>
                <span className="stat-label">Trust Verifiers</span>
            </div>
        </div>
      </div>

      <div className="grid-middle-row" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        <div className="chart-box">
            <h3 className="chart-title">Global Platform Performance (Revenue)</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData.length > 0 ? barData : [{name: 'Uber', revenue: 4000}, {name: 'InDrive', revenue: 3000}]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 11}} />
                        <YAxis stroke="#64748b" tick={{fontSize: 11}} />
                        <Tooltip contentStyle={{ background: 'white', borderRadius: '8px' }} />
                        <Bar dataKey="revenue" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="chart-box">
            <h3 className="chart-title">User Role Distribution</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                            {pieData.map((c, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'white', borderRadius: '8px' }} />
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
                    {pieData.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                            <div style={{ width: '8px', height: '8px', background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: '50%' }}></div>
                            <span>{p.name}: {p.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="grid-bottom-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="chart-box">
            <h3 className="chart-title">System User Directory & Performance</h3>
            <div className="data-table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Work Count</th>
                            <th>Total Earned</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => {
                            const userEarnings = earnings.filter(e => e.worker_id === u.id);
                            const total = userEarnings.reduce((acc, curr) => acc + parseFloat(curr.net_received), 0);
                            return (
                                <tr key={u.id}>
                                    <td>
                                        <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{u.email}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {u.id.substring(0,8)}...</div>
                                    </td>
                                    <td><span className={`badge ${u.role === 'admin' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>{u.role}</span></td>
                                    <td style={{ textAlign: 'center' }}>{userEarnings.length}</td>
                                    <td style={{ fontWeight: '700', color: 'var(--accent-teal)' }}>Rs. {total.toLocaleString()}</td>
                                    <td>
                                        {u.email !== user.email && (
                                            <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="chart-box">
            <h3 className="chart-title">Provisional User Onboarding</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Directly provision high-privileged accounts (Advocates/Verifiers) or demo workers.</p>
            <form onSubmit={handleCreateUser}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Email Address</label>
                    <input type="email" placeholder="email@example.com" className="auth-input" style={{ marginTop: '0.3rem' }} value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Password</label>
                    <input type="password" placeholder="••••••••" className="auth-input" style={{ marginTop: '0.3rem' }} value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>System Role</label>
                    <select className="auth-input" style={{ marginTop: '0.3rem' }} value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                        <option value="worker">Gig Worker</option>
                        <option value="verifier">Verifier (Audit)</option>
                        <option value="advocate">Platform Advocate</option>
                        <option value="admin">System Admin</option>
                    </select>
                </div>
                <button type="submit" className="auth-btn" style={{ background: 'var(--accent-teal)' }}>
                    <UserPlus size={18} /> Provision New Account
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
