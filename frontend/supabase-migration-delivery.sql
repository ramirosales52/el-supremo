-- =============================================================
-- EL SUPREMO - Migration: Delivery scheduling & idempotency
-- Run in Supabase Dashboard > SQL Editor
-- =============================================================

ALTER TABLE orders
  ADD COLUMN "idempotencyKey" VARCHAR(36) UNIQUE,
  ADD COLUMN "deliveryDate" DATE,
  ADD COLUMN "deliveryTimeSlot" VARCHAR(10) DEFAULT 'afternoon';
