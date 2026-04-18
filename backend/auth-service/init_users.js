require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function initDefaultUsers() {
    console.log("Initializing default test users...");

    // 1. Delete the old admin if it exists
    const oldAdminEmail = 'admin@test.com';
    const { data: { users: allAuthUsers } } = await supabase.auth.admin.listUsers();
    const oldAdmin = allAuthUsers.find(u => u.email === oldAdminEmail);
    if (oldAdmin) {
        console.log(`Deleting old admin: ${oldAdminEmail}`);
        await supabase.from('users').delete().eq('email', oldAdminEmail);
        await supabase.auth.admin.deleteUser(oldAdmin.id);
    }

    const users = [
        { email: 'worker@test.com', role: 'worker', password: 'password123' },
        { email: 'verifier@test.com', role: 'verifier', password: 'password123' },
        { email: 'advocate@test.com', role: 'advocate', password: 'password123' },
        { email: 'boss@gmail.com', role: 'admin', password: 'taha123' }
    ];

    for (const u of users) {
        try {
            const hashedPassword = await bcrypt.hash(u.password, 10);
            let userId;

            const existingAuth = allAuthUsers.find(x => x.email === u.email);

            if (existingAuth) {
                userId = existingAuth.id;
                console.log(`Updating existing user: ${u.email}`);
                await supabase.auth.admin.updateUserById(userId, { password: u.password });
            } else {
                console.log(`Creating new user: ${u.email}`);
                const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                    email: u.email,
                    password: u.password,
                    email_confirm: true
                });
                if (authError) {
                    console.error(`Auth Error for ${u.email}:`, authError.message);
                    continue;
                }
                userId = authUser.user.id;
            }

            // Sync to public.users
            const { error } = await supabase.from('users').upsert([{
                id: userId,
                email: u.email,
                role: u.role,
                password_hash: hashedPassword
            }]);

            if (error) {
                console.error(`Failed to update DB for ${u.email}:`, error.message);
            } else {
                console.log(`Successfully synced ${u.email} (${u.role})`);
            }
        } catch (err) {
            console.error(`Unexpected error for ${u.email}:`, err);
        }
    }
    console.log("Initialization complete!");
}

initDefaultUsers();
