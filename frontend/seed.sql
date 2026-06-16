-- =============================================================
-- EL SUPREMO - PRODUCT SEED DATA (run AFTER schema.sql)
-- =============================================================

-- PRODUCTS: Vacuno - Asado y Parrilla
INSERT INTO products (name, description, "basePrice", unit, image, "isAvailable", "categoryId") VALUES
  ('Tapa de asado', '', 22990, 'kg', '', TRUE, 1),
  ('Vacío', '', 25990, 'kg', '', TRUE, 1),
  ('Matambre', '', 26990, 'kg', '', TRUE, 1),
  ('Entraña', '', 26990, 'kg', '', TRUE, 1),
  ('Marucha', '', 22990, 'kg', '', TRUE, 1),
  ('Falda', '', 19990, 'kg', '', TRUE, 1),
  ('Costilla banderita', '', 23990, 'kg', '', TRUE, 1),
  ('Costillar del medio', '', 25990, 'kg', '', TRUE, 1),
  ('Costillar entero', '', 22990, 'kg', '', TRUE, 1),
  ('Corte Mar del Plata', '', 24990, 'kg', '', TRUE, 1);

-- PRODUCTS: Vacuno - Pulpas y Cortes Finos
INSERT INTO products (name, description, "basePrice", unit, image, "isAvailable", "categoryId") VALUES
  ('Nalga', '', 28990, 'kg', '', TRUE, 1),
  ('Tapa de nalga', '', 22990, 'kg', '', TRUE, 1),
  ('Cuadrada', '', 24990, 'kg', '', TRUE, 1),
  ('Bola de lomo', '', 24990, 'kg', '', TRUE, 1),
  ('Peceto', '', 25990, 'kg', '', TRUE, 1),
  ('Cuadril', '', 24990, 'kg', '', TRUE, 1),
  ('Colita de cuadril', '', 28990, 'kg', '', TRUE, 1),
  ('Lomo', '', 29990, 'kg', '', TRUE, 1),
  ('Tortuguita', '', 22990, 'kg', '', TRUE, 1),
  ('Palomita', '', 22990, 'kg', '', TRUE, 1);

-- PRODUCTS: Vacuno - Cocina y Olla
INSERT INTO products (name, description, "basePrice", unit, image, "isAvailable", "categoryId") VALUES
  ('Roast Beef', '', 22990, 'kg', '', TRUE, 1),
  ('Aguja', '', 18990, 'kg', '', TRUE, 1),
  ('Paleta', '', 22990, 'kg', '', TRUE, 1),
  ('Osobuco', '', 14990, 'kg', '', TRUE, 1);

-- PRODUCTS: Vacuno - Bifes Premium
INSERT INTO products (name, description, "basePrice", unit, image, "isAvailable", "categoryId") VALUES
  ('Ojo de bife', '', 26990, 'kg', '', TRUE, 1),
  ('Bife de chorizo', '', 26990, 'kg', '', TRUE, 1),
  ('Entrecot', '', 26990, 'kg', '', TRUE, 1);

-- PRODUCTS: Vacuno - Costeletas
INSERT INTO products (name, description, "basePrice", unit, image, "isAvailable", "categoryId") VALUES
  ('Costeleta ancha', '', 20990, 'kg', '', TRUE, 1),
  ('Costeleta angosta', '', 20990, 'kg', '', TRUE, 1),
  ('Costeleta redonda', '', 21990, 'kg', '', TRUE, 1),
  ('Carne picada común', '', 12990, 'kg', '', TRUE, 1);

-- PRODUCTS: Cerdo
INSERT INTO products (name, description, "basePrice", unit, image, "isAvailable", "categoryId") VALUES
  ('Solomillo', '', 16990, 'kg', '', TRUE, 2),
  ('Matambre', '', 16990, 'kg', '', TRUE, 2),
  ('Churrasco', '', 16990, 'kg', '', TRUE, 2),
  ('Bondiola', '', 12990, 'kg', '', TRUE, 2),
  ('Marucha', '', 8990, 'kg', '', TRUE, 2),
  ('Costilla', '', 10990, 'kg', '', TRUE, 2),
  ('Vacío', '', 11990, 'kg', '', TRUE, 2),
  ('Costeleta', '', 9990, 'kg', '', TRUE, 2),
  ('Pulpa', '', 11990, 'kg', '', TRUE, 2),
  ('Pulpa de paleta', '', 10990, 'kg', '', TRUE, 2);

-- PRODUCTS: Pollo
INSERT INTO products (name, description, "basePrice", unit, image, "isAvailable", "categoryId") VALUES
  ('Pollo entero', '', 6990, 'kg', '', TRUE, 3),
  ('Pollo trozado', '', 6990, 'kg', '', TRUE, 3),
  ('Cuarto trasero', '', 5990, 'kg', '', TRUE, 3),
  ('Pata de pollo', '', 6990, 'kg', '', TRUE, 3),
  ('Muslo de pollo', '', 6990, 'kg', '', TRUE, 3),
  ('Patamuslo', '', 6990, 'kg', '', TRUE, 3),
  ('Alitas', '', 4990, 'kg', '', TRUE, 3),
  ('Filet de pechuga', '', 13990, 'kg', '', TRUE, 3),
  ('Filet de muslo', '', 13990, 'kg', '', TRUE, 3);

-- PRODUCTS: Elaborados
INSERT INTO products (name, description, "basePrice", unit, image, "isAvailable", "categoryId") VALUES
  ('Hamburguesas de pollo', '', 9990, 'kg', '', TRUE, 4),
  ('Hamburguesas de carne', '', 13990, 'kg', '', TRUE, 4),
  ('Milanesa de vaca', '', 19900, 'kg', '', TRUE, 4),
  ('Milanesa de pollo', '', 11900, 'kg', '', TRUE, 4),
  ('Milanesa de cerdo', '', 11900, 'kg', '', TRUE, 4);

-- PRODUCTS: Chacinados
INSERT INTO products (name, description, "basePrice", unit, image, "isAvailable", "categoryId") VALUES
  ('Chorizo puro cerdo', '', 11900, 'kg', '', TRUE, 5),
  ('Morcilla casera', '', 11900, 'kg', '', TRUE, 5),
  ('Salamín', '', 26900, 'kg', '', TRUE, 5);

-- PRODUCTS: Menudencias
INSERT INTO products (name, description, "basePrice", unit, image, "isAvailable", "categoryId") VALUES
  ('Mondongo', '', 12900, 'kg', '', TRUE, 6),
  ('Riñón', '', 12900, 'kg', '', TRUE, 6),
  ('Corazón', '', 12900, 'kg', '', TRUE, 6),
  ('Chinchulín', '', 14900, 'kg', '', TRUE, 6),
  ('Tripa gorda', '', 14900, 'kg', '', TRUE, 6),
  ('Molleja', '', 39900, 'kg', '', TRUE, 6);

-- =============================================================
-- MANY-TO-MANY: products <-> cut_options
-- =============================================================

-- Helper: Vacuno (cat 1), Cerdo (cat 2), Pollo (cat 3), Elaborados (cat 4), Chacinados (cat 5), Menudencias (cat 6)
-- Get product IDs by name (ordered by insertion)
-- We match by name and categoryId to get the right ID

-- VACUNO - ASADO Y PARRILLA (products 1-10)
INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Tapa de asado' AND c.name IN ('Pieza entera', 'Trozo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Vacío' AND c.name IN ('Pieza entera', 'Trozo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Matambre' AND c.name IN ('Pieza entera', 'Trozo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Entraña' AND c.name IN ('Pieza entera');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Marucha' AND p."categoryId" = 1 AND c.name IN ('Corte fino', 'Corte grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Falda' AND c.name IN ('Corte fino', 'Corte grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Costilla banderita' AND c.name IN ('Corte fino', 'Corte grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Costillar del medio' AND c.name IN ('Pieza completa');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Costillar entero' AND c.name IN ('Pieza completa');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Corte Mar del Plata' AND c.name IN ('Corte fino', 'Corte grueso');

-- VACUNO - PULPAS (products 11-20)
INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Nalga' AND p."categoryId" = 1 AND c.name IN ('Pieza entera', 'Trozo', 'Bife fino', 'Bife grueso', 'Cubos', 'Tiritas', 'Picada');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Tapa de nalga' AND c.name IN ('Pieza entera', 'Trozo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Cuadrada' AND p."categoryId" = 1 AND c.name IN ('Pieza entera', 'Trozo', 'Bife fino', 'Bife grueso', 'Cubos', 'Tiritas', 'Picada');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Bola de lomo' AND c.name IN ('Pieza entera', 'Trozo', 'Bife fino', 'Bife grueso', 'Cubos', 'Tiritas', 'Picada');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Peceto' AND c.name IN ('Pieza entera', 'Trozo', 'Bife fino', 'Bife grueso', 'Cubos', 'Tiritas', 'Picada');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Cuadril' AND c.name IN ('Pieza entera', 'Trozo', 'Bife fino', 'Bife grueso', 'Cubos', 'Tiritas', 'Picada');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Colita de cuadril' AND c.name IN ('Pieza entera');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Lomo' AND c.name IN ('Pieza entera', 'Trozo', 'Bife fino', 'Bife grueso', 'Cubos', 'Tiritas', 'Picada');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Tortuguita' AND c.name IN ('Pieza entera', 'Trozo', 'Bife fino', 'Bife grueso', 'Cubos', 'Tiritas', 'Picada');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Palomita' AND c.name IN ('Pieza entera', 'Trozo', 'Bife fino', 'Bife grueso', 'Cubos', 'Tiritas', 'Picada');

-- VACUNO - COCINA Y OLLA (products 21-24)
INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Roast Beef' AND c.name IN ('Trozo', 'Churrasco fino', 'Churrasco grueso', 'Picada');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Aguja' AND c.name IN ('Corte fino', 'Corte grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Paleta' AND c.name IN ('Pieza entera', 'Trozo', 'Churrasco fino', 'Churrasco grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Osobuco' AND c.name IN ('Rodaja fina', 'Rodaja gruesa');

-- VACUNO - BIFES PREMIUM (products 25-27)
INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Ojo de bife' AND c.name IN ('Churrasco fino', 'Churrasco grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Bife de chorizo' AND c.name IN ('Churrasco fino', 'Churrasco grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Entrecot' AND c.name IN ('Churrasco fino', 'Churrasco grueso');

-- VACUNO - COSTELETAS (products 28-31)
INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Costeleta ancha' AND c.name IN ('Corte fino', 'Corte grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Costeleta angosta' AND c.name IN ('Corte fino', 'Corte grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Costeleta redonda' AND c.name IN ('Corte fino', 'Corte grueso');

-- Carne picada común (no cut options)

-- CERDO (products 32-41)
INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Solomillo' AND c.name IN ('Pieza entera', 'Trozo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Matambre' AND p."categoryId" = 2 AND c.name IN ('Pieza entera', 'Trozo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Churrasco' AND c.name IN ('Churrasco fino', 'Churrasco grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Bondiola' AND c.name IN ('Pieza entera', 'Trozo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Marucha' AND p."categoryId" = 2 AND c.name IN ('Corte fino', 'Corte grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Costilla' AND c.name IN ('Corte fino', 'Corte grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Vacío' AND p."categoryId" = 2 AND c.name IN ('Pieza entera', 'Trozo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Costeleta' AND p."categoryId" = 2 AND c.name IN ('Corte fino', 'Corte grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Pulpa' AND p."categoryId" = 2 AND c.name IN ('Pieza entera', 'Trozo', 'Bife fino', 'Bife grueso', 'Cubos', 'Tiritas', 'Picada');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Pulpa de paleta' AND c.name IN ('Pieza entera', 'Trozo', 'Bife fino', 'Bife grueso', 'Cubos', 'Tiritas', 'Picada');

-- POLLO (products 42-50)
INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Pollo entero' AND c.name IN ('Entero', 'Trozado');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Filet de pechuga' AND c.name IN ('Entero', 'Bife fino', 'Bife grueso', 'Cubos', 'Tiritas', 'Picado');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Filet de muslo' AND c.name IN ('Entero', 'Bife fino', 'Bife grueso', 'Cubos', 'Tiritas', 'Picado');

-- ELABORADOS (products 51-55)
INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Milanesa de vaca' AND c.name IN ('Nalga', 'Cuadrada', 'Bola de lomo', 'Cuadril', 'Peceto');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Milanesa de pollo' AND c.name IN ('Pechuga', 'Muslo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Milanesa de cerdo' AND c.name IN ('Pulpa', 'Bondiola');

-- CHACINADOS (products 56-58)
INSERT INTO products_cut_options ("productId", "cutOptionId")
SELECT p.id, c.id FROM products p, cut_options c
WHERE p.name = 'Salamín' AND c.name IN ('Pieza entera', 'Bastón', 'Fraccionado por unidad');

-- MENUDENCIAS (products 59-64) - no cut options

-- =============================================================
-- RLS: Allow public read access for products, categories, cut_options
-- =============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cut_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_cut_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON cut_options FOR SELECT USING (true);
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access" ON products_cut_options FOR SELECT USING (true);

-- Expose tables to the Data API (grant anon + authenticated read access)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
