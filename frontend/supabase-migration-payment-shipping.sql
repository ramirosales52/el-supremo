-- =============================================================
-- EL SUPREMO - Migration: Payment methods & shipping
-- Run in Supabase Dashboard > SQL Editor
-- =============================================================

ALTER TABLE orders
  ADD COLUMN "paymentMethod" VARCHAR(20) DEFAULT 'cash',
  ADD COLUMN "paymentStatus" VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN subtotal DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN discount DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN "shippingCost" DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN total DECIMAL(10,2) DEFAULT 0;
