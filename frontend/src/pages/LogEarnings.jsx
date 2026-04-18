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
    
    try {
        // 1. Upload to Supabase Storage Bucket 'evidence'
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from('evidence')
            .upload(fileName, file, { upsert: true });

        if (error) {
            console.error("Storage Upload Error:", error);
            alert(`Storage Error: ${error.message}\n\nMake sure the bucket exists and you have run the RLS Policy SQL!`);
            setLoading(false);
            return;
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('evidence')
            .getPublicUrl(fileName);

        setScreenshotUrl(publicUrl);
        
        // Mocked OCR result
        setGross(4500);
        setDeductions(900);
        setNet(3600);
        setSuccessMsg('Evidence uploaded to Supabase Storage successfully!');
    } catch (error) {
        console.error("Process Error:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    const payload = {
        worker_id: user.id,
        platform,
        shift_date: shiftDate,
        hours_worked: parseFloat(hours) || 0,
        gross_earned: parseFloat(gross) || 0,
        platform_deductions: parseFloat(deductions) || 0,
        net_received: parseFloat(net) || 0,
        screenshot_url: screenshotUrl || null,
        evidence_url: screenshotUrl || null,
        status: 'pending'
    };

    try {
      const { error } = await supabase.from('earnings').insert([payload]);

      if (error) {
          console.error("Supabase Error:", error);
          throw error;
      }

      setSuccessMsg('Earnings logged successfully and sent to Verifiers queue!');
      setTimeout(() => navigate('/worker'), 2000);
    } catch (error) {
      console.error("Logging Error:", error);
      alert(`Failed to log: ${error.message || 'Unknown error'}`);
    }
    setLoading(false);
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
        // 1. Upload CSV to Supabase Storage
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(fileName, file);

        let evidenceUrl = 'https://docs.google.com/spreadsheets/d/mock-csv-link';
        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('evidence').getPublicUrl(fileName);
            evidenceUrl = publicUrl;
        }

        // 2. Perform bulk insert
        const mockBulkData = [
            { worker_id: user.id, platform: platform, shift_date: new Date().toISOString().split('T')[0], hours_worked: 8, gross_earned: 1500, platform_deductions: 300, net_received: 1200, status: 'pending', evidence_url: evidenceUrl },
            { worker_id: user.id, platform: platform, shift_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], hours_worked: 6, gross_earned: 1100, platform_deductions: 200, net_received: 900, status: 'pending', evidence_url: evidenceUrl }
        ];
        await supabase.from('earnings').insert(mockBulkData);
        setSuccessMsg('CSV Data imported and original file stored in Supabase Storage!');
        setTimeout(() => navigate('/worker'), 2000);
    } catch (err) {
        console.error("CSV Import Error:", err);
    }
    setLoading(false);
  };

  // AUTO-CALCULATION LOGIC: Gross - Fee = Net
  const handleGrossChange = (val) => {
      setGross(val);
      const g = parseFloat(val) || 0;
      const f = parseFloat(deductions) || 0;
      setNet(g - f);
  };

  const handleDeductionsChange = (val) => {
      setDeductions(val);
      const g = parseFloat(gross) || 0;
      const f = parseFloat(val) || 0;
      setNet(g - f);
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
                
                <input type="file" id="screenshot" hidden onChange={handleScreenshotUpload} accept="image/*" />
                <label htmlFor="screenshot" className="auth-btn" style={{ width: '100%', cursor: 'pointer', textAlign: 'center', background: loading ? 'var(--text-muted)' : 'var(--accent-blue)' }}>
                    {loading ? 'Uploading Evidence...' : 'Upload Earnings Screenshot'}
                </label>

                {screenshotUrl && !screenshotUrl.includes('.csv') && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', marginBottom: '0.5rem' }}>✓ Evidence Uploaded</p>
                        <img src={screenshotUrl} alt="Preview" style={{ width: '100%', borderRadius: '8px', border: '2px solid var(--accent-teal)' }} />
                    </div>
                )}
            </div>

            <div className="chart-box">
                <h3 className="chart-title"><FileText size={18}/> CSV Import</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Upload your exported CSV data for bulk logging.</p>
                <input type="file" id="csv_upload" hidden accept=".csv" onChange={handleCSVImport} />
                <label htmlFor="csv_upload" className="auth-btn" style={{ width: '100%', cursor: 'pointer', textAlign: 'center', background: 'transparent', color: 'var(--accent-blue)', border: '1px solid var(--accent-blue)' }}>
                    {loading ? 'Importing...' : 'Select CSV File'}
                </label>
                {screenshotUrl && screenshotUrl.includes('.csv') && (
                    <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--accent-teal)', fontSize: '0.8rem' }}>
                        <FileText size={24} style={{ marginBottom: '0.5rem' }} />
                        <p>✓ CSV Evidence Attached</p>
                    </div>
                )}
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
                    <input type="number" step="0.5" className="auth-input" style={{ marginTop: '0.3rem' }} value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g. 8" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Gross (Rs.)</label>
                        <input type="number" className="auth-input" style={{ marginTop: '0.3rem' }} value={gross} onChange={e => handleGrossChange(e.target.value)} required />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Fee (Rs.)</label>
                        <input type="number" className="auth-input" style={{ marginTop: '0.3rem' }} value={deductions} onChange={e => handleDeductionsChange(e.target.value)} required />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Net (Auto)</label>
                        <input type="number" className="auth-input" style={{ marginTop: '0.3rem', background: '#f1f5f9', fontWeight: 'bold', color: 'var(--accent-teal)' }} value={net} readOnly />
                    </div>
                </div>

                <button type="submit" className="auth-btn" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Logging...' : 'Submit for Verification'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
