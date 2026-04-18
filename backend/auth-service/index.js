require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'hackathon_secret_key_123';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'hackathon_refresh_secret_456';

app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    // CRITICAL: New registrations can ONLY be workers as per hackathon requirements
    const role = 'worker'; 


    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (authError) return res.status(400).json({ error: authError.message });

        const userId = authUser.user.id;
        const { error } = await supabase.from('users').insert([{
            id: userId,
            email,
            role,
            password_hash: hashedPassword
        }]);

        if (error) return res.status(400).json({ error: error.message });
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

    // Since our seeded users don't have password_hash, we let them login with 'password123' automatically for the demo
    let validPass = false;
    if (!user.password_hash && password === 'password123') {
        validPass = true;
    } else if (user.password_hash) {
        validPass = await bcrypt.compare(password, user.password_hash);
    }

    if (!validPass) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

    res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } });
});

app.post('/api/auth/refresh', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json({ error: 'Refresh token required' });

    jwt.verify(token, REFRESH_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid refresh token' });
        
        const { data: user } = await supabase.from('users').select('*').eq('id', decoded.id).single();
        if (!user) return res.status(403).json({ error: 'User no longer exists' });

        const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    });
});

// Middleware for other services to reuse (exported as a pattern)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access token missing' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

const checkRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ error: `Requires ${role} role` });
        }
        next();
    };
};

app.get('/api/auth/me', verifyToken, (req, res) => {
    res.json(req.user);
});

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});
