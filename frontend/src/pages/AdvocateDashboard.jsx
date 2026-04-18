import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { Mail, Briefcase, Users, DollarSign, Download } from 'lucide-react';
import axios from 'axios';

const PIE_COLORS = ['#6870fa', '#3da58a', '#f59e0b', '#ef4444'];
const BAR_COLORS = ['#3da58a', '#f59e0b', '#6870fa', '#ef4444', '#70d8bd'];

// Mock Data for aesthetics if backend fails
const mockLineData = [
  { name: 'plane', Uber: 100, FoodPanda: 300, InDrive: 500 },
  { name: 'helicopter', Uber: 80, FoodPanda: 250, InDrive: 400 },
  { name: 'boat', Uber: 200, FoodPanda: 300, InDrive: 420 },
  { name: 'train', Uber: 150, FoodPanda: 200, InDrive: 440 },
  { name: 'subway', Uber: 250, FoodPanda: 420, InDrive: 350 },
  { name: 'bus', Uber: 100, FoodPanda: 280, InDrive: 500 },
  { name: 'car', Uber: 120, FoodPanda: 250, InDrive: 380 },
  { name: 'moto', Uber: 150, FoodPanda: 300, InDrive: 420 },
  { name: 'bicycle', Uber: 280, FoodPanda: 420, InDrive: 350 },
  { name: 'horse', Uber: 100, FoodPanda: 300, InDrive: 480 },
  { name: 'skateboard', Uber: 150, FoodPanda: 250, InDrive: 420 },
  { name: 'others', Uber: 200, FoodPanda: 280, InDrive: 400 },
];

const mockBarData = [
    { name: 'AD', Uber: 40, FoodPanda: 24, InDrive: 24 },
    { name: 'AE', Uber: 30, FoodPanda: 13, InDrive: 22 },
    { name: 'AF', Uber: 20, FoodPanda: 98, InDrive: 22 },
    { name: 'AG', Uber: 27, FoodPanda: 39, InDrive: 20 },
    { name: 'AI', Uber: 18, FoodPanda: 48, InDrive: 21 },
    { name: 'AL', Uber: 23, FoodPanda: 38, InDrive: 25 },
    { name: 'AM', Uber: 34, FoodPanda: 43, InDrive: 21 },
];

export default function AdvocateDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ commissionTrends: [], complaintsCount: 0, vulnerabilityFlags: 0 });

  useEffect(() => {
    async function loadData() {
        try {
            const res = await axios.get('http://localhost:8001/api/analytics/dashboard');
            setStats(res.data);
        } catch (error) {
            console.error(error);
        }
    }
    loadData();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">Dashboard</h1>
          <p className="header-subtitle">Welcome to your dashboard</p>
        </div>
      </div>

      <div className="grid-top-row">
        <div className="stat-box">
            <div className="stat-left">
                <Mail color="var(--accent-teal)" size={24} />
                <span className="stat-value">12,361</span>
                <span className="stat-label">Total Shifts Logged</span>
            </div>
            <div className="stat-right">
                <div className="progress-circle"></div>
                <span className="stat-percent">+14%</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <Briefcase color="var(--accent-teal)" size={24} />
                <span className="stat-value">431,225</span>
                <span className="stat-label">Verified Earnings</span>
            </div>
            <div className="stat-right">
                <div className="progress-circle" style={{ borderColor: 'var(--accent-blue)' }}></div>
                <span className="stat-percent">+21%</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <Users color="var(--accent-teal)" size={24} />
                <span className="stat-value">32,441</span>
                <span className="stat-label">Platform Workers</span>
            </div>
            <div className="stat-right">
                <div className="progress-circle"></div>
                <span className="stat-percent">+5%</span>
            </div>
        </div>
        <div className="stat-box">
            <div className="stat-left">
                <DollarSign color="var(--accent-teal)" size={24} />
                <span className="stat-value">1,325,134</span>
                <span className="stat-label">Total Commission</span>
            </div>
            <div className="stat-right">
                <div className="progress-circle" style={{ borderColor: 'var(--accent-blue)' }}></div>
                <span className="stat-percent">+43%</span>
            </div>
        </div>
      </div>

      <div className="grid-middle-row">
        <div className="chart-box">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <h3 className="chart-title">Revenue Generated</h3>
                    <h2 className="chart-subtitle">$59,342.32</h2>
                </div>
                <Download color="var(--accent-teal)" size={20} />
            </div>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockLineData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10, fill: '#64748b'}} />
                        <YAxis stroke="#64748b" tick={{fontSize: 10, fill: '#64748b'}} />
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
                        <Line type="monotone" dataKey="Uber" stroke="var(--accent-green)" strokeWidth={2} dot={{r: 3}} />
                        <Line type="monotone" dataKey="FoodPanda" stroke="var(--accent-blue)" strokeWidth={2} dot={{r: 3}} />
                        <Line type="monotone" dataKey="InDrive" stroke="#ef4444" strokeWidth={2} dot={{r: 3}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="chart-box" style={{ overflowY: 'auto' }}>
            <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Recent Grievances</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                            <div style={{ color: 'var(--accent-teal)', fontSize: '0.9rem', fontWeight: 'bold' }}>Grievance {i}</div>
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>Payment dispute</div>
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>2026-04-01</div>
                        <div style={{ background: 'var(--accent-green)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Pending</div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid-bottom-row">
        <div className="chart-box">
            <h3 className="chart-title">Grievance Distribution</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={[{name: 'A', value: 400}, {name: 'B', value: 300}, {name: 'C', value: 300}]} innerRadius={50} outerRadius={70} fill="#8884d8" paddingAngle={5} dataKey="value">
                            {PIE_COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ textAlign: 'center', marginTop: '-1rem' }}>
                    <div style={{ color: 'var(--accent-teal)', fontSize: '1.2rem', fontWeight: 'bold' }}>$48,352</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>Estimated Lost Revenue</div>
                </div>
            </div>
        </div>

        <div className="chart-box">
            <h3 className="chart-title">Sales Quantity</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockBarData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10, fill: '#64748b'}} />
                        <YAxis stroke="#64748b" tick={{fontSize: 10, fill: '#64748b'}} />
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                        <Bar dataKey="Uber" stackId="a" fill={BAR_COLORS[0]} />
                        <Bar dataKey="FoodPanda" stackId="a" fill={BAR_COLORS[1]} />
                        <Bar dataKey="InDrive" stackId="a" fill={BAR_COLORS[2]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="chart-box">
            <h3 className="chart-title">Geography Based Traffic</h3>
            <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                [Map Visualization Placeholder]
            </div>
        </div>
      </div>
    </div>
  );
}
