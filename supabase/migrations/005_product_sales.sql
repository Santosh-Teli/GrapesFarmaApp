-- =============================================================
-- 13. PRODUCT SALES
-- =============================================================
CREATE TABLE IF NOT EXISTS public.product_sales (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_name    text NOT NULL,
  sale_date       date NOT NULL,
  quantity        numeric NOT NULL,
  unit            text NOT NULL CHECK (unit IN ('KG', 'Quintal', 'Ton')),
  rate_per_unit   numeric NOT NULL,
  total_income    numeric NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;

-- Policies for product_sales
CREATE POLICY "Users can view their own product sales"
  ON public.product_sales FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product sales"
  ON public.product_sales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product sales"
  ON public.product_sales FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product sales"
  ON public.product_sales FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_product_sales_user_id ON public.product_sales(user_id);
