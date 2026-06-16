-- =============================================================
-- EL SUPREMO - RLS Policies for orders
-- Paste in Supabase Dashboard > SQL Editor > New Query and RUN
-- =============================================================

-- ORDERS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert" ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public select" ON orders FOR SELECT TO anon USING (true);
CREATE POLICY "Public update" ON orders FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public delete" ON orders FOR DELETE TO anon USING (true);

CREATE POLICY "Public insert" ON order_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public select" ON order_items FOR SELECT TO anon USING (true);
CREATE POLICY "Public update" ON order_items FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public delete" ON order_items FOR DELETE TO anon USING (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
