-- =============================================================
-- EL SUPREMO - RLS Policies
-- Paste in Supabase Dashboard > SQL Editor > New Query and RUN
-- =============================================================

-- ORDERS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas viejas permisivas
DROP POLICY IF EXISTS "Public insert" ON orders;
DROP POLICY IF EXISTS "Public select" ON orders;
DROP POLICY IF EXISTS "Public update" ON orders;
DROP POLICY IF EXISTS "Public delete" ON orders;

DROP POLICY IF EXISTS "Public insert" ON order_items;
DROP POLICY IF EXISTS "Public select" ON order_items;
DROP POLICY IF EXISTS "Public update" ON order_items;
DROP POLICY IF EXISTS "Public delete" ON order_items;

-- Políticas mínimas para que funcione sin backend
CREATE POLICY "Public insert" ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public select" ON orders FOR SELECT TO anon USING (true);
CREATE POLICY "Public update" ON orders FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Public insert" ON order_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public select" ON order_items FOR SELECT TO anon USING (true);

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
