-- Users table
CREATE TABLE public.users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('worker', 'verifier', 'advocate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Earnings logs
CREATE TABLE public.earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID REFERENCES public.users(id) NOT NULL,
    platform TEXT NOT NULL,
    shift_date DATE NOT NULL,
    hours_worked NUMERIC NOT NULL,
    gross_earned NUMERIC NOT NULL,
    platform_deductions NUMERIC NOT NULL,
    net_received NUMERIC NOT NULL,
    screenshot_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'disputed', 'unverifiable')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Grievances
CREATE TABLE public.grievances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID REFERENCES public.users(id) NOT NULL,
    platform TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'escalated', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

-- Create policies (Example: workers can read own earnings)
CREATE POLICY "Users can view their own record" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Workers can insert earnings" ON public.earnings FOR INSERT WITH CHECK (auth.uid() = worker_id);
CREATE POLICY "Workers can view own earnings" ON public.earnings FOR SELECT USING (auth.uid() = worker_id);
CREATE POLICY "Verifiers can view all earnings" ON public.earnings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'verifier')
);
CREATE POLICY "Verifiers can update earnings status" ON public.earnings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'verifier')
);
