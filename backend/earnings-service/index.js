require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Setup multer for screenshot uploads
const upload = multer({ dest: 'uploads/' });

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/api/earnings/log', async (req, res) => {
    const { worker_id, platform, shift_date, hours_worked, gross_earned, platform_deductions, net_received } = req.body;
    
    // In a real scenario:
    // const { data, error } = await supabase.from('earnings').insert([...]);

    // Hackathon feature: trigger Anomaly Detection
    // axios.post('http://localhost:8000/api/anomaly/detect', { worker_id, recent_earnings: [...] })

    res.json({ message: 'Earnings logged successfully', status: 'pending' });
});

app.post('/api/earnings/upload-screenshot', upload.single('screenshot'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Provide a mocked AI OCR extraction for the hackathon
    const mockExtractedData = {
        gross_earned: 4500,
        platform_deductions: 900,
        net_received: 3600
    };

    res.json({ 
        message: 'Screenshot uploaded', 
        file_path: req.file.path,
        extracted_data: mockExtractedData 
    });
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
    console.log(`Earnings Service running on port ${PORT}`);
});
