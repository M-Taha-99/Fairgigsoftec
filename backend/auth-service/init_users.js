require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function initDefaultUsers() {
    console.log("Initializing default test users...");

    const users = [
        { email: 'worker@test.com', role: 'worker', password: 'password123' },
        { email: 'verifier@test.com', role: 'verifier', password: 'password123' },
        { email: 'advocate@test.com', role: 'advocate', password: 'password123' }
    ];

    for (const u of users) {
        try {
            // Check if exists
            const { data: existing } = await supabase.from('users').select('id').eq('email', u.email).single();
            if (existing) {
                console.log(`User ${u.email} already exists.`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(u.password, 10);
            
            // Create in auth.users first due to foreign key constraint
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true
            });

            if (authError && !authError.message.includes('already registered')) {
                console.error(`Auth Error for ${u.email}:`, authError.message);
                continue;
            }

            // Get ID (either newly created or fetch existing)
            let userId;
            if (authUser?.user) {
                userId = authUser.user.id;
            } else {
                const { data: existingAuth } = await supabase.auth.admin.listUsers();
                userId = existingAuth.users.find(x => x.email === u.email)?.id;
            }

            const { error } = await supabase.from('users').upsert([{
                id: userId,
                email: u.email,
                role: u.role,
                password_hash: hashedPassword
            }]);

            if (error) {
                console.error(`Failed to create ${u.email}:`, error.message);
            } else {
                console.log(`Successfully created ${u.email} (${u.role})`);
            }
        } catch (err) {
            console.error(err);
        }
    }
    console.log("Done!");
}

initDefaultUsers();
