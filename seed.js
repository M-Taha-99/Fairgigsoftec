require('dotenv').config({ path: './frontend/.env' });
const { createClient } = require('@supabase/supabase-js');

// We need the service key to bypass RLS for seeding
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dqsoibjyoryhwebyjatc.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxc29pYmp5b3J5aHdlYnlqYXRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjUwMDIwMiwiZXhwIjoyMDkyMDc2MjAyfQ.v2N0vhjoL0431vC-tQLnj_GVxp_Pi5oSF0AnaATYY5M';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  console.log('Seeding FairGig database...');

  // Since we rely on auth.users for foreign keys, we need to create some mock users via the admin API
  const mockWorkers = ['alex.worker@example.com', 'sarah.rider@example.com', 'john.delivery@example.com'];
  
  let workerIds = [];

  console.log('Creating mock users in Auth...');
  for (const email of mockWorkers) {
    const { data: user, error } = await supabase.auth.admin.createUser({
      email: email,
      password: 'password123',
      email_confirm: true
    });
    
    if (error) {
      if (error.code === 'email_exists' || (error.message && error.message.includes('already registered'))) {
        console.log(`User ${email} already exists, fetching ID...`);
        // If they exist, we just need their ID. 
        // Fetch from auth.users via admin api
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const existingUser = authUsers.users.find(u => u.email === email);
        if (existingUser) {
          workerIds.push(existingUser.id);
          // Try to insert into public.users just in case it's missing
          await supabase.from('users').upsert({ id: existingUser.id, email: email, role: 'worker' }).select();
        }
      } else {
        console.error('Error creating auth user:', error);
      }
    } else {
      console.log(`Created user: ${email} -> ${user.user.id}`);
      workerIds.push(user.user.id);
      
      // Insert into public.users
      await supabase.from('users').insert({
        id: user.user.id,
        email: email,
        role: 'worker'
      });
    }
  }

  if (workerIds.length === 0) {
    console.error('No worker IDs available. Run failed.');
    return;
  }

  console.log('Inserting mock earnings...');
  const earningsData = [];
  const platforms = ['Uber', 'FoodPanda', 'InDrive', 'Bykea'];
  
  // Generate 50 random shifts
  for (let i = 0; i < 50; i++) {
    const worker_id = workerIds[Math.floor(Math.random() * workerIds.length)];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const hours = Math.floor(Math.random() * 8) + 2;
    const rate = 300 + Math.random() * 200; // 300 to 500 per hour
    const gross = hours * rate;
    const deductions = gross * (0.15 + Math.random() * 0.15); // 15% to 30% commission
    const net = gross - deductions;

    // Shift date in the past 30 days
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));

    earningsData.push({
      worker_id,
      platform,
      shift_date: d.toISOString().split('T')[0],
      hours_worked: hours.toFixed(2),
      gross_earned: gross.toFixed(2),
      platform_deductions: deductions.toFixed(2),
      net_received: net.toFixed(2),
      status: Math.random() > 0.2 ? 'verified' : 'pending'
    });
  }

  const { error: err1 } = await supabase.from('earnings').insert(earningsData);
  if (err1) console.error('Error inserting earnings:', err1);
  else console.log(`Inserted ${earningsData.length} earnings logs.`);

  console.log('Inserting mock grievances...');
  const grievanceData = [];
  const categories = ['Deactivation', 'Missing Payment', 'High Commission', 'Harassment'];
  
  for (let i = 0; i < 15; i++) {
    grievanceData.push({
      worker_id: workerIds[Math.floor(Math.random() * workerIds.length)],
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      description: 'This is a mock grievance auto-generated for testing purposes.',
      status: Math.random() > 0.5 ? 'open' : 'escalated'
    });
  }

  const { error: err2 } = await supabase.from('grievances').insert(grievanceData);
  if (err2) console.error('Error inserting grievances:', err2);
  else console.log(`Inserted ${grievanceData.length} grievances.`);

  console.log('Seeding complete!');
}

seed();
