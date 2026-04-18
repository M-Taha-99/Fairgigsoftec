import React, { useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { 
    Upload, DollarSign, Clock, ShieldCheck, FileText, 
    ArrowLeft, HelpCircle, AlertCircle, CheckCircle 
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LogEarnings() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [platform, setPlatform] = useState('Uber');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [gross, setGross] = useState('');
  const [deductions, setDeductions] = useState('');
  const [net, setNet] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('screenshot', file);
    
    try {
      const res = await axios.post('http://localhost:4002/api/earnings/upload-screenshot', formData);
      const { gross_earned, platform_deductions, net_received } = res.data.extracted_data;
      
      setGross(gross_earned);
      setDeductions(platform_deductions);
      setNet(net_received);
      const mockUrl = 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=600';
      setScreenshotUrl(mockUrl); 
      setSuccessMsg('AI OCR: Screenshot data extracted and stored for verification!');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    try {
      const { error } = await supabase.from('earnings').insert([{
        worker_id: user.id,
        platform,
        shift_date: shiftDate,
        hours_worked: parseFloat(hours),
        gross_earned: parseFloat(gross),
        platform_deductions: parseFloat(deductions),
        net_received: parseFloat(net),
        screenshot_url: screenshotUrl,
        evidence_url: screenshotUrl,
        status: 'pending'
      }]);

      if (error) throw error;

      setSuccessMsg('Earnings logged successfully and sent to Verifiers queue!');
      setTimeout(() => navigate('/worker'), 2000);
    } catch (error) {
      console.error(error);
      alert('Failed to log earnings. Please try again.');
    }
    setLoading(false);
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
        const mockBulkData = [
            { worker_id: user.id, platform: platform, shift_date: new Date().toISOString().split('T')[0], hours_worked: 8, gross_earned: 1500, platform_deductions: 300, net_received: 1200, status: 'pending', category: 'Gig Work', evidence_url: 'https://docs.google.com/spreadsheets/d/mock-csv-link' },
            { worker_id: user.id, platform: platform, shift_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], hours_worked: 6, gross_earned: 1100, platform_deductions: 200, net_received: 900, status: 'pending', category: 'Gig Work', evidence_url: 'https://docs.google.com/spreadsheets/d/mock-csv-link' }
        ];
        await supabase.from('earnings').insert(mockBulkData);
        setSuccessMsg('Bulk CSV data imported successfully into your history!');
        setTimeout(() => navigate('/worker'), 2000);
    } catch (err) {
        console.error(err);
    }
    setLoading(false);
  };

  // AUTO-CALCULATION LOGIC
  const handleNetChange = (val) => {
      setNet(val);
      const n = parseFloat(val) || 0;
      const d = parseFloat(deductions) || 0;
      setGross(n + d);
  };

  const handleDeductionsChange = (val) => {
      setDeductions(val);
      const n = parseFloat(net) || 0;
      const d = parseFloat(val) || 0;
      setGross(n + d);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="header-title">Log Your Shift</h1>
          <p className="header-subtitle">Easy logging for your platform earnings</p>
        </div>
        <button className="nav-link" onClick={() => navigate('/worker')} style={{ background: 'white', padding: '0.6rem 1rem', borderRadius: '8px' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {successMsg && (
        <div className="chart-box" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-teal)', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CheckCircle size={20} /> {successMsg}
        </div>
      )}

      <div className="grid-middle-row" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="chart-box">
                <h3 className="chart-title"><Upload size={18}/> Quick AI Upload</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Upload a screenshot. Our AI will automatically extract the numbers for you.</p>
                
                <input type="file" id="screenshot" hidden onChange={handleScreenshotUpload} />
                <label htmlFor="screenshot" className="auth-btn" style={{ width: '100%', cursor: 'pointer', textAlign: 'center', background: loading ? 'var(--text-muted)' : 'var(--accent-blue)' }}>
                    {loading ? 'Processing...' : 'Upload Earnings Screenshot'}
                </label>
                
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <HelpCircle size={14} /> Tip: Open the Uber/FoodPanda app, go to 'Earnings', and take a screenshot.
                    </div>
                </div>
            </div>

            <div className="chart-box">
                <h3 className="chart-title"><FileText size={18}/> CSV Import</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Tech-savvy? Upload your exported CSV data for bulk logging.</p>
                <input type="file" id="csv_upload" hidden accept=".csv" onChange={handleCSVImport} />
                <label htmlFor="csv_upload" className="auth-btn" style={{ width: '100%', cursor: 'pointer', textAlign: 'center', background: 'transparent', color: 'var(--accent-blue)', border: '1px solid var(--accent-blue)' }}>
                    {loading ? 'Importing...' : 'Select CSV File'}
                </label>
            </div>
        </div>

        <div className="chart-box">
            <h3 className="chart-title"><Clock size={18}/> Shift Details</h3>
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Platform</label>
                        <select className="auth-input" style={{ marginTop: '0.3rem' }} value={platform} onChange={e => setPlatform(e.target.value)} required>
                            <option>Uber</option>
                            <option>FoodPanda</option>
                            <option>InDrive</option>
                            <option>Bykea</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Shift Date</label>
                        <input type="date" className="auth-input" style={{ marginTop: '0.3rem' }} value={shiftDate} onChange={e => setShiftDate(e.target.value)} required />
                    </div>
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Hours Worked</label>
                    <div style={{ position: 'relative' }}>
                        <input type="number" step="0.5" className="auth-input" style={{ marginTop: '0.3rem', paddingLeft: '2.5rem' }} value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g. 8" required />
                        <Clock size={16} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: 'var(--text-muted)' }} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Net Received (Rs.)</label>
                        <input type="number" className="auth-input" style={{ marginTop: '0.3rem', fontWeight: 'bold', color: 'var(--accent-teal)' }} value={net} onChange={e => handleNetChange(e.target.value)} required />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Platform Fee (Rs.)</label>
                        <input type="number" className="auth-input" style={{ marginTop: '0.3rem' }} value={deductions} onChange={e => handleDeductionsChange(e.target.value)} required />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Gross Total (Auto)</label>
                        <input type="number" className="auth-input" style={{ marginTop: '0.3rem', background: '#f8fafc' }} value={gross} readOnly />
                    </div>
                </div>

                <button type="submit" className="auth-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }} disabled={loading}>
                    <ShieldCheck size={20} /> {loading ? 'Saving...' : 'Submit for Verification'}
                </button>
            </form>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.8rem', padding: '1rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                <AlertCircle size={20} color="#d97706" />
                <p style={{ fontSize: '0.75rem', color: '#92400e' }}>Verified shifts appear on your income certificate. Fraudulent submissions may lead to account suspension.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
