import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, DollarSign, Clock, ShieldCheck, FileText } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

export default function LogEarnings() {
  const { user } = useContext(AuthContext);
  const [platform, setPlatform] = useState('Uber');
  const [shiftDate, setShiftDate] = useState('');
  const [hours, setHours] = useState('');
  const [gross, setGross] = useState('');
  const [deductions, setDeductions] = useState('');
  const [net, setNet] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Simulate Hackathon "AI Receipt OCR" by calling the Earnings Service endpoint
    setLoading(true);
    const formData = new FormData();
    formData.append('screenshot', file);
    
    try {
      const res = await axios.post('http://localhost:4002/api/earnings/upload-screenshot', formData);
      const { gross_earned, platform_deductions, net_received } = res.data.extracted_data;
      setGross(gross_earned);
      setDeductions(platform_deductions);
      setNet(net_received);
      setSuccessMsg('Receipt scanned successfully using AI OCR!');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    const worker_id = user.id;

    try {
      await axios.post('http://localhost:4002/api/earnings/log', {
        worker_id,
        platform,
        shift_date: shiftDate,
        hours_worked: hours,
        gross_earned: gross,
        platform_deductions: deductions,
        net_received: net
      });

      // Also directly insert into supabase for immediacy in UI
      await supabase.from('earnings').insert([{
        worker_id,
        platform,
        shift_date: shiftDate,
        hours_worked: parseFloat(hours),
        gross_earned: parseFloat(gross),
        platform_deductions: parseFloat(deductions),
        net_received: parseFloat(net),
        status: 'pending'
      }]);

      setSuccessMsg('Earnings logged successfully and sent to Verifiers queue!');
      setHours(''); setGross(''); setDeductions(''); setNet(''); setShiftDate('');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    // Simulate CSV parsing and bulk insertion
    setTimeout(async () => {
        const mockBulkData = [
            { worker_id: user.id, platform: 'Uber', shift_date: '2026-04-10', hours_worked: 8, gross_earned: 1200, platform_deductions: 200, net_received: 1000, status: 'verified' },
            { worker_id: user.id, platform: 'Bykea', shift_date: '2026-04-11', hours_worked: 6, gross_earned: 900, platform_deductions: 150, net_received: 750, status: 'verified' }
        ];
        await supabase.from('earnings').insert(mockBulkData);
        setSuccessMsg('Bulk CSV data imported successfully!');
        setLoading(false);
    }, 1500);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 className="text-3xl font-bold mb-2">Log Earnings</h2>
        <p className="text-secondary">Submit your shift details for verification and intelligence tracking.</p>
      </header>

      {successMsg && (
        <div className="glass-panel" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-success)', color: 'var(--accent-success)' }}>
          {successMsg}
        </div>
      )}

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="glass-panel">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Upload size={18}/> Quick AI Upload</h3>
            <p className="text-sm text-secondary mb-4">Upload a screenshot of your platform earnings page and our AI will automatically fill the fields below.</p>
            <input type="file" id="screenshot" hidden onChange={handleScreenshotUpload} />
            <label htmlFor="screenshot" className="btn btn-secondary" style={{ width: '100%', marginBottom: '1rem' }}>
                {loading ? 'Scanning...' : 'Upload Screenshot'}
            </label>

            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ marginTop: '1rem' }}><FileText size={18}/> Bulk CSV Import</h3>
            <p className="text-sm text-secondary mb-4">Export your data from the platform and upload the CSV here.</p>
            <input type="file" id="csv_upload" hidden accept=".csv" onChange={handleCSVImport} />
            <label htmlFor="csv_upload" className="btn btn-secondary" style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }}>
                {loading ? 'Importing...' : 'Import CSV'}
            </label>
        </div>

        <div className="glass-panel">
            <h3 className="font-bold mb-4 flex items-center gap-2"><FileText size={18}/> Manual Entry</h3>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <span className="input-label">Platform</span>
                    <select className="input-field" value={platform} onChange={e => setPlatform(e.target.value)} required>
                        <option>Uber</option>
                        <option>FoodPanda</option>
                        <option>InDrive</option>
                        <option>Bykea</option>
                    </select>
                </div>
                
                <div className="input-group">
                    <span className="input-label">Shift Date</span>
                    <input type="date" className="input-field" value={shiftDate} onChange={e => setShiftDate(e.target.value)} required />
                </div>

                <div className="input-group">
                    <span className="input-label">Hours Worked</span>
                    <input type="number" className="input-field" step="0.5" value={hours} onChange={e => setHours(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="input-group mb-0">
                        <span className="input-label">Gross</span>
                        <input type="number" className="input-field" value={gross} onChange={e => setGross(e.target.value)} required />
                    </div>
                    <div className="input-group mb-0">
                        <span className="input-label">Deductions</span>
                        <input type="number" className="input-field" value={deductions} onChange={e => setDeductions(e.target.value)} required />
                    </div>
                    <div className="input-group mb-0">
                        <span className="input-label">Net Received</span>
                        <input type="number" className="input-field" value={net} onChange={e => setNet(e.target.value)} required />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    <ShieldCheck size={18} /> Submit for Verification
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
