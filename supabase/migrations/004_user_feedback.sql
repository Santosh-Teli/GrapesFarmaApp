-- =============================================================
-- 12. USER FEEDBACKS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.user_feedbacks (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message     text NOT NULL,
  status      text NOT NULL DEFAULT 'UNREAD' CHECK (status IN ('UNREAD', 'READ', 'RESOLVED')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_feedbacks ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.user_feedbacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Only admins can view feedback
CREATE POLICY "Admins can view all feedback"
  ON public.user_feedbacks FOR SELECT
  USING (public.is_admin());

-- Policy: Only admins can update feedback status
CREATE POLICY "Admins can update feedback"
  ON public.user_feedbacks FOR UPDATE
  USING (public.is_admin());

-- Policy: Only admins can delete feedback
CREATE POLICY "Admins can delete feedback"
  ON public.user_feedbacks FOR DELETE
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_user_feedbacks_user_id ON public.user_feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedbacks_status  ON public.user_feedbacks(status);
