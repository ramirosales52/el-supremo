-- =============================================================
-- EL SUPREMO - Esquema completo para Supabase
-- Pegar en Supabase Dashboard > SQL Editor > New Query
-- =============================================================

-- 1. CATEGORIAS
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
  images JSONB DEFAULT '[]'::jsonb,
  "isAvailable" BOOLEAN DEFAULT TRUE,
  "isOnSale" BOOLEAN DEFAULT FALSE,
  "discountPercentage" INTEGER DEFAULT NULL,
  "categoryId" INTEGER REFERENCES categories(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- 4. PRODUCTS <-> CUT OPTIONS (many-to-many)
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
  "paymentMethod" VARCHAR(20) DEFAULT 'cash',
  "paymentStatus" VARCHAR(20) DEFAULT 'pending',
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  "shippingCost" DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
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
-- DATA: CATEGORIES
-- =============================================================
INSERT INTO categories (name, description) VALUES
  ('Vacuno', 'Cortes de carne vacuna'),
  ('Cerdo', 'Cortes de cerdo'),
  ('Pollo', 'Pollos y piezas'),
  ('Elaborados', 'Milanesas y hamburguesas'),
  ('Chacinados', 'Embutidos y fiambres'),
  ('Menudencias', 'Menudencias y achuras');

-- =============================================================
-- DATA: CUT OPTIONS
-- =============================================================
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
