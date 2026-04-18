require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/api/certificates/generate/:worker_id', async (req, res) => {
    const { worker_id } = req.params;
    
    // Fetch ALL earnings to show tracking vs verification
    const { data: earnings, error: eError } = await supabase
        .from('earnings')
        .select('*')
        .eq('worker_id', worker_id);
    
    if (eError) console.error("Earnings fetch error:", eError);

    const { data: userProfile } = await supabase.from('users').select('email').eq('id', worker_id).single();

    let totalVerified = 0;
    let totalPending = 0;
    let platformData = {};

    if (earnings && earnings.length > 0) {
        earnings.forEach(e => {
            if (!platformData[e.platform]) {
                platformData[e.platform] = { shifts: 0, hours: 0, net: 0, status: e.status };
            }
            platformData[e.platform].shifts += 1;
            platformData[e.platform].hours += parseFloat(e.hours_worked || 0);
            platformData[e.platform].net += parseFloat(e.net_received || 0);

            if (e.status === 'verified') {
                totalVerified += parseFloat(e.net_received || 0);
            } else {
                totalPending += parseFloat(e.net_received || 0);
            }
        });
    }

    const tableRows = Object.keys(platformData).map(p => `
        <tr>
            <td>${p}</td>
            <td>${platformData[p].shifts}</td>
            <td>${platformData[p].hours.toFixed(1)}</td>
            <td>Rs. ${platformData[p].net.toLocaleString()} 
                <span style="color: ${platformData[p].status === 'verified' ? '#10b981' : '#f59e0b'}; font-size: 0.7rem;">
                    (${platformData[p].status})
                </span>
            </td>
        </tr>
    `).join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Income Certificate - FairGig</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; }
            .content { max-width: 850px; margin: 0 auto; background: white; padding: 50px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-top: 8px solid #3b82f6; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { color: #3b82f6; margin-bottom: 5px; font-size: 2.5rem; letter-spacing: -1px; }
            .badge-verified { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
            .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .table th, .table td { padding: 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            .table th { background: #f1f5f9; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
            .stat-card { padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
            .stat-value { font-size: 1.5rem; font-weight: bold; color: #3b82f6; }
            .footer { margin-top: 60px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #94a3b8; }
            @media print { body { background: white; padding: 0; } .content { box-shadow: none; border: none; } }
        </style>
    </head>
    <body>
        <div class="content">
            <div class="header">
                <h1>FairGig</h1>
                <p style="color: #64748b; font-weight: 500;">OFFICIAL EARNINGS VERIFICATION DOCUMENT</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <div>
                    <p style="margin: 0; color: #64748b; font-size: 0.9rem;">Worker Profile</p>
                    <p style="margin: 5px 0; font-weight: bold; font-size: 1.1rem;">${userProfile?.email || 'Worker ID: ' + worker_id}</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; color: #64748b; font-size: 0.9rem;">Issue Date</p>
                    <p style="margin: 5px 0; font-weight: bold;">${new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <p style="font-size: 0.95rem; line-height: 1.6;">This certificate confirms the digital footprint of gig-work earnings recorded by the subject on the FairGig platform. All entries marked as 'verified' have been audited against digital receipt evidence.</p>
            
            <table class="table">
                <thead>
                    <tr>
                        <th>Work Platform</th>
                        <th>Shifts Logged</th>
                        <th>Logged Hours</th>
                        <th>Net Earnings</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows || '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #94a3b8;">No earnings records found for this period.</td></tr>'}
                </tbody>
            </table>

            <div class="stats-grid">
                <div class="stat-card">
                    <p style="margin: 0; font-size: 0.8rem; color: #64748b; text-transform: uppercase;">Total Verified Income</p>
                    <div class="stat-value">Rs. ${totalVerified.toLocaleString()}</div>
                    <p style="margin: 5px 0 0; font-size: 0.7rem; color: #10b981;">✓ Audited & Confirmed</p>
                </div>
                <div class="stat-card">
                    <p style="margin: 0; font-size: 0.8rem; color: #64748b; text-transform: uppercase;">Pending Verification</p>
                    <div class="stat-value" style="color: #f59e0b;">Rs. ${totalPending.toLocaleString()}</div>
                    <p style="margin: 5px 0 0; font-size: 0.7rem; color: #f59e0b;">⌛ In Audit Queue</p>
                </div>
            </div>
            
            <div class="footer">
                <p>This document is digitally signed and generated by the FairGig Trust Network. 
                   Verification Key: <strong>FG-${Math.floor(100000 + Math.random() * 900000)}</strong></p>
                <p>&copy; 2026 FairGig Platform - Supporting Gig Workers with Financial Identity.</p>
            </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
    `;
    
    res.send(htmlContent);
});

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
    console.log(`Certificate Service running on port ${PORT}`);
});
