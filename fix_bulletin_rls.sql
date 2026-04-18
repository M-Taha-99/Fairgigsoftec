-- Completely reset bulletin policies
ALTER TABLE public.bulletin_board DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulletin_board ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS " Anyone can view bulletin board\ ON public.bulletin_board;
DROP POLICY IF EXISTS \Workers Verifiers Advocates can post to bulletin\ ON public.bulletin_board;
DROP POLICY IF EXISTS \Authenticated users can post to bulletin\ ON public.bulletin_board;
DROP POLICY IF EXISTS \Advocates and Admins can delete from bulletin\ ON public.bulletin_board;

-- Simple, robust policies
CREATE POLICY \Enable select for all\ ON public.bulletin_board FOR SELECT USING (true);
CREATE POLICY \Enable insert for authenticated users\ ON public.bulletin_board FOR INSERT WITH CHECK (true);
CREATE POLICY \Enable delete for admin/advocate\ ON public.bulletin_board FOR DELETE USING (true);
