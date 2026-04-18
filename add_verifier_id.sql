ALTER TABLE public.earnings ADD COLUMN IF NOT EXISTS verifier_id UUID REFERENCES public.users(id);
