require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/api/grievances', async (req, res) => {
    const { worker_id, platform, category, description } = req.body;
    
    const { error } = await supabase.from('grievances').insert([{ worker_id, platform, category, description }]);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Grievance submitted successfully', status: 'open' });
});

app.get('/api/grievances/cluster', async (req, res) => {
    // Basic clustering logic: find complaints grouped by category and platform
    const { data: grievances } = await supabase.from('grievances').select('*');
    
    if (!grievances) return res.json({ clusters: [] });

    const clustersMap = {};
    grievances.forEach(g => {
        const key = `${g.platform}-${g.category}`;
        if (!clustersMap[key]) {
            clustersMap[key] = { platform: g.platform, category: g.category, count: 0, status: 'open' };
        }
        clustersMap[key].count += 1;
        if (g.status === 'escalated') clustersMap[key].status = 'escalated';
    });

    const clusters = Object.values(clustersMap).sort((a, b) => b.count - a.count);
    res.json({ clusters });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`Grievance Service running on port ${PORT}`);
});
