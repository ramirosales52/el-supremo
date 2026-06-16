-- =============================================================
-- EL SUPREMO - Full Supabase Schema + Seed
-- Paste in Supabase Dashboard > SQL Editor > New Query and RUN
-- Safe to re-run (drops existing tables first)
-- =============================================================

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products_cut_options CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS cut_options CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 1. CATEGORIES
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- 2. CUT OPTIONS
CREATE TABLE cut_options (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  "priceModifier" DECIMAL(10,2),
  "requiresNotes" BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- 3. PRODUCTS
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  "basePrice" DECIMAL(10,2) NOT NULL,
  unit VARCHAR(10) DEFAULT 'kg',
  image VARCHAR DEFAULT '',
  "isAvailable" BOOLEAN DEFAULT TRUE,
  "categoryId" INTEGER REFERENCES categories(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- 4. PRODUCTS <-> CUT OPTIONS (M:N)
CREATE TABLE products_cut_options (
  "productId" INTEGER REFERENCES products(id) ON DELETE CASCADE,
  "cutOptionId" INTEGER REFERENCES cut_options(id) ON DELETE CASCADE,
  PRIMARY KEY ("productId", "cutOptionId")
);

-- 5. ORDERS
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  "customerName" VARCHAR(200) NOT NULL,
  "customerPhone" VARCHAR(50) NOT NULL,
  "customerAddress" VARCHAR(300),
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- 6. ORDER ITEMS
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  "orderId" INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  "productId" INTEGER REFERENCES products(id),
  "cutOptionId" INTEGER REFERENCES cut_options(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(10),
  "unitPrice" DECIMAL(10,2) NOT NULL,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- =============================================================
-- SEED DATA
-- =============================================================

-- CATEGORIES
INSERT INTO categories (name, description) VALUES
  ('Vacuno', 'Cortes de carne vacuna'),
  ('Cerdo', 'Cortes de cerdo'),
  ('Pollo', 'Pollos y piezas'),
  ('Elaborados', 'Milanesas y hamburguesas'),
  ('Chacinados', 'Embutidos y fiambres'),
  ('Menudencias', 'Menudencias y achuras');

-- CUT OPTIONS
INSERT INTO cut_options (name, description, "priceModifier", "requiresNotes") VALUES
  ('Pieza entera', 'Pieza entera sin procesar', NULL, FALSE),
  ('Trozo', 'Cortado en trozos', NULL, FALSE),
  ('Corte fino', 'Corte de espesor fino', NULL, FALSE),
  ('Corte grueso', 'Corte de espesor grueso', NULL, FALSE),
  ('Pieza completa', 'La pieza completa tal cual', NULL, FALSE),
  ('Bife fino', 'Bife de espesor fino', NULL, FALSE),
  ('Bife grueso', 'Bife de espesor grueso', NULL, FALSE),
  ('Cubos', 'Cortado en cubos', NULL, FALSE),
  ('Tiritas', 'Cortado en tiras', NULL, FALSE),
  ('Picada', 'Carne picada', NULL, FALSE),
  ('Churrasco fino', 'Churrasco de espesor fino', NULL, FALSE),
  ('Churrasco grueso', 'Churrasco de espesor grueso', NULL, FALSE),
  ('Rodaja fina', 'Rodaja de espesor fino', NULL, FALSE),
  ('Rodaja gruesa', 'Rodaja de espesor grueso', NULL, FALSE),
  ('Entero', 'Entero sin procesar', NULL, FALSE),
  ('Trozado', 'Cortado en presas', NULL, FALSE),
  ('Picado', 'Picado fino', NULL, FALSE),
  ('Bastón', 'Corte en bastón', NULL, FALSE),
  ('Fraccionado por unidad', 'Fraccionado por unidad', NULL, FALSE),
  ('Nalga', 'Milanesa de nalga', NULL, FALSE),
  ('Cuadrada', 'Milanesa de cuadrada', NULL, FALSE),
  ('Bola de lomo', 'Milanesa de bola de lomo', NULL, FALSE),
  ('Cuadril', 'Milanesa de cuadril', NULL, FALSE),
  ('Peceto', 'Milanesa de peceto', NULL, FALSE),
  ('Pechuga', 'Milanesa de pechuga de pollo', NULL, FALSE),
  ('Muslo', 'Milanesa de muslo de pollo', NULL, FALSE),
  ('Pulpa', 'Milanesa de pulpa de cerdo', NULL, FALSE),
  ('Bondiola', 'Milanesa de bondiola', NULL, FALSE);

-- PRODUCTS: Vacuno - Asado y Parrilla
INSERT INTO products (name, "basePrice", "categoryId") VALUES
  ('Tapa de asado', 22990, 1),
  ('Vacío', 25990, 1),
  ('Matambre', 26990, 1),
  ('Entraña', 26990, 1),
  ('Marucha', 22990, 1),
  ('Falda', 19990, 1),
  ('Costilla banderita', 23990, 1),
  ('Costillar del medio', 25990, 1),
  ('Costillar entero', 22990, 1),
  ('Corte Mar del Plata', 24990, 1);

-- PRODUCTS: Vacuno - Pulpas y Cortes Finos
INSERT INTO products (name, "basePrice", "categoryId") VALUES
  ('Nalga', 28990, 1),
  ('Tapa de nalga', 22990, 1),
  ('Cuadrada', 24990, 1),
  ('Bola de lomo', 24990, 1),
  ('Peceto', 25990, 1),
  ('Cuadril', 24990, 1),
  ('Colita de cuadril', 28990, 1),
  ('Lomo', 29990, 1),
  ('Tortuguita', 22990, 1),
  ('Palomita', 22990, 1);

-- PRODUCTS: Vacuno - Cocina y Olla
INSERT INTO products (name, "basePrice", "categoryId") VALUES
  ('Roast Beef', 22990, 1),
  ('Aguja', 18990, 1),
  ('Paleta', 22990, 1),
  ('Osobuco', 14990, 1);

-- PRODUCTS: Vacuno - Bifes Premium
INSERT INTO products (name, "basePrice", "categoryId") VALUES
  ('Ojo de bife', 26990, 1),
  ('Bife de chorizo', 26990, 1),
  ('Entrecot', 26990, 1);

-- PRODUCTS: Vacuno - Costeletas
INSERT INTO products (name, "basePrice", "categoryId") VALUES
  ('Costeleta ancha', 20990, 1),
  ('Costeleta angosta', 20990, 1),
  ('Costeleta redonda', 21990, 1),
  ('Carne picada común', 12990, 1);

-- PRODUCTS: Cerdo
INSERT INTO products (name, "basePrice", "categoryId") VALUES
  ('Solomillo', 16990, 2),
  ('Matambre', 16990, 2),
  ('Churrasco', 16990, 2),
  ('Bondiola', 12990, 2),
  ('Marucha', 8990, 2),
  ('Costilla', 10990, 2),
  ('Vacío', 11990, 2),
  ('Costeleta', 9990, 2),
  ('Pulpa', 11990, 2),
  ('Pulpa de paleta', 10990, 2);

-- PRODUCTS: Pollo
INSERT INTO products (name, "basePrice", "categoryId") VALUES
  ('Pollo entero', 6990, 3),
  ('Pollo trozado', 6990, 3),
  ('Cuarto trasero', 5990, 3),
  ('Pata de pollo', 6990, 3),
  ('Muslo de pollo', 6990, 3),
  ('Patamuslo', 6990, 3),
  ('Alitas', 4990, 3),
  ('Filet de pechuga', 13990, 3),
  ('Filet de muslo', 13990, 3);

-- PRODUCTS: Elaborados
INSERT INTO products (name, "basePrice", "categoryId") VALUES
  ('Hamburguesas de pollo', 9990, 4),
  ('Hamburguesas de carne', 13990, 4),
  ('Milanesa de vaca', 19900, 4),
  ('Milanesa de pollo', 11900, 4),
  ('Milanesa de cerdo', 11900, 4);

-- PRODUCTS: Chacinados
INSERT INTO products (name, "basePrice", "categoryId") VALUES
  ('Chorizo puro cerdo', 11900, 5),
  ('Morcilla casera', 11900, 5),
  ('Salamín', 26900, 5);

-- PRODUCTS: Menudencias
INSERT INTO products (name, "basePrice", "categoryId") VALUES
  ('Mondongo', 12900, 6),
  ('Riñón', 12900, 6),
  ('Corazón', 12900, 6),
  ('Chinchulín', 14900, 6),
  ('Tripa gorda', 14900, 6),
  ('Molleja', 39900, 6);

-- =============================================================
-- M:N: PRODUCTS <-> CUT OPTIONS (using name + category matching)
-- =============================================================

-- VACUNO: Asado y Parrilla
INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Tapa de asado' AND p."categoryId" = 1 AND c.name IN ('Pieza entera', 'Trozo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Vacío' AND p."categoryId" = 1 AND c.name IN ('Pieza entera', 'Trozo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Matambre' AND p."categoryId" = 1 AND c.name IN ('Pieza entera', 'Trozo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Entraña' AND c.name IN ('Pieza entera');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Marucha' AND p."categoryId" = 1 AND c.name IN ('Corte fino', 'Corte grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Falda' AND p."categoryId" = 1 AND c.name IN ('Corte fino', 'Corte grueso');

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

-- VACUNO: Pulpas y Cortes Finos
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

-- VACUNO: Cocina y Olla
INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Roast Beef' AND c.name IN ('Trozo', 'Churrasco fino', 'Churrasco grueso', 'Picada');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Aguja' AND c.name IN ('Corte fino', 'Corte grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Paleta' AND p."categoryId" = 1 AND c.name IN ('Pieza entera', 'Trozo', 'Churrasco fino', 'Churrasco grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Osobuco' AND c.name IN ('Rodaja fina', 'Rodaja gruesa');

-- VACUNO: Bifes Premium
INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Ojo de bife' AND c.name IN ('Churrasco fino', 'Churrasco grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Bife de chorizo' AND c.name IN ('Churrasco fino', 'Churrasco grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Entrecot' AND c.name IN ('Churrasco fino', 'Churrasco grueso');

-- VACUNO: Costeletas
INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Costeleta ancha' AND c.name IN ('Corte fino', 'Corte grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Costeleta angosta' AND c.name IN ('Corte fino', 'Corte grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Costeleta redonda' AND c.name IN ('Corte fino', 'Corte grueso');

-- CERDO
INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Solomillo' AND c.name IN ('Pieza entera', 'Trozo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Matambre' AND p."categoryId" = 2 AND c.name IN ('Pieza entera', 'Trozo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Churrasco' AND p."categoryId" = 2 AND c.name IN ('Churrasco fino', 'Churrasco grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Bondiola' AND c.name IN ('Pieza entera', 'Trozo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Marucha' AND p."categoryId" = 2 AND c.name IN ('Corte fino', 'Corte grueso');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Costilla' AND p."categoryId" = 2 AND c.name IN ('Corte fino', 'Corte grueso');

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

-- POLLO
INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Pollo entero' AND c.name IN ('Entero', 'Trozado');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Filet de pechuga' AND c.name IN ('Entero', 'Bife fino', 'Bife grueso', 'Cubos', 'Tiritas', 'Picado');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Filet de muslo' AND c.name IN ('Entero', 'Bife fino', 'Bife grueso', 'Cubos', 'Tiritas', 'Picado');

-- ELABORADOS
INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Milanesa de vaca' AND c.name IN ('Nalga', 'Cuadrada', 'Bola de lomo', 'Cuadril', 'Peceto');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Milanesa de pollo' AND c.name IN ('Pechuga', 'Muslo');

INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Milanesa de cerdo' AND c.name IN ('Pulpa', 'Bondiola');

-- CHACINADOS
INSERT INTO products_cut_options ("productId", "cutOptionId")
  SELECT p.id, c.id FROM products p, cut_options c
  WHERE p.name = 'Salamín' AND c.name IN ('Pieza entera', 'Bastón', 'Fraccionado por unidad');

-- =============================================================
-- RLS: Public read access (for frontend anon key)
-- =============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cut_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_cut_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON cut_options FOR SELECT USING (true);
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access" ON products_cut_options FOR SELECT USING (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
