
-- Fix: restrict log inserts to user's own logs
DROP POLICY "Authenticated users can insert logs" ON public.system_logs;
CREATE POLICY "Users can insert own logs" ON public.system_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
