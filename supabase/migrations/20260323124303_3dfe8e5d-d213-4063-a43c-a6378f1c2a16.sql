
-- Fix permissive INSERT policy on system_logs - restrict to authenticated users only
DROP POLICY "Insert logs" ON public.system_logs;
CREATE POLICY "Authenticated users can insert logs" ON public.system_logs FOR INSERT TO authenticated WITH CHECK (true);
