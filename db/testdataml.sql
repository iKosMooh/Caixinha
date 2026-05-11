-- SCRIPT DE POPULAÇÃO PARA TESTE DE ML (Regressão Linear)
-- Referência de "Hoje": 07/05/2026

-- 1. Produtos — upsert por barcode (não força ID)
INSERT INTO products (barcode, name, brand, default_category)
VALUES
  ('7891000100101', 'Leite Integral 1L', 'Piracanjuba', 'Laticínios'),
  ('7891000100202', 'Arroz Branco 5kg',  'Tio João',    'Grãos')
ON CONFLICT (barcode) DO NOTHING;

-- 2. Lotes de estoque atual (referencia produto pelo barcode)
INSERT INTO lots (product_id, location_id, qty, status, expiry_date, entered_at)
SELECT p.id, 2, 6, 'fechado', '2026-06-01', '2026-04-20'
FROM products p WHERE p.barcode = '7891000100101'
  AND NOT EXISTS (
    SELECT 1 FROM lots l WHERE l.product_id = p.id AND l.entered_at = '2026-04-20'
  );

INSERT INTO lots (product_id, location_id, qty, status, expiry_date, entered_at)
SELECT p.id, 4, 2, 'fechado', '2027-01-01', '2026-04-20'
FROM products p WHERE p.barcode = '7891000100202'
  AND NOT EXISTS (
    SELECT 1 FROM lots l WHERE l.product_id = p.id AND l.entered_at = '2026-04-20'
  );

-- 3. Histórico de consumo do Leite (~1 un. a cada 2 dias)
INSERT INTO stock_movements (lot_id, type, qty, occurred_at)
SELECT l.id, 'in',       10, '2026-04-20 08:00:00' FROM lots l JOIN products p ON p.id = l.product_id WHERE p.barcode = '7891000100101' AND l.entered_at = '2026-04-20' LIMIT 1;
INSERT INTO stock_movements (lot_id, type, qty, occurred_at)
SELECT l.id, 'out_used',  1, '2026-04-22 09:00:00' FROM lots l JOIN products p ON p.id = l.product_id WHERE p.barcode = '7891000100101' AND l.entered_at = '2026-04-20' LIMIT 1;
INSERT INTO stock_movements (lot_id, type, qty, occurred_at)
SELECT l.id, 'out_used',  1, '2026-04-24 10:15:00' FROM lots l JOIN products p ON p.id = l.product_id WHERE p.barcode = '7891000100101' AND l.entered_at = '2026-04-20' LIMIT 1;
INSERT INTO stock_movements (lot_id, type, qty, occurred_at)
SELECT l.id, 'out_used',  1, '2026-04-26 08:30:00' FROM lots l JOIN products p ON p.id = l.product_id WHERE p.barcode = '7891000100101' AND l.entered_at = '2026-04-20' LIMIT 1;
INSERT INTO stock_movements (lot_id, type, qty, occurred_at)
SELECT l.id, 'out_used',  1, '2026-04-28 09:00:00' FROM lots l JOIN products p ON p.id = l.product_id WHERE p.barcode = '7891000100101' AND l.entered_at = '2026-04-20' LIMIT 1;

-- 4. Histórico de consumo do Arroz (~1 un. a cada 10 dias)
INSERT INTO stock_movements (lot_id, type, qty, occurred_at)
SELECT l.id, 'in',       5, '2026-03-01 08:00:00' FROM lots l JOIN products p ON p.id = l.product_id WHERE p.barcode = '7891000100202' AND l.entered_at = '2026-04-20' LIMIT 1;
INSERT INTO stock_movements (lot_id, type, qty, occurred_at)
SELECT l.id, 'out_used', 1, '2026-03-10 12:00:00' FROM lots l JOIN products p ON p.id = l.product_id WHERE p.barcode = '7891000100202' AND l.entered_at = '2026-04-20' LIMIT 1;
INSERT INTO stock_movements (lot_id, type, qty, occurred_at)
SELECT l.id, 'out_used', 1, '2026-03-20 12:00:00' FROM lots l JOIN products p ON p.id = l.product_id WHERE p.barcode = '7891000100202' AND l.entered_at = '2026-04-20' LIMIT 1;
INSERT INTO stock_movements (lot_id, type, qty, occurred_at)
SELECT l.id, 'out_used', 1, '2026-03-30 12:00:00' FROM lots l JOIN products p ON p.id = l.product_id WHERE p.barcode = '7891000100202' AND l.entered_at = '2026-04-20' LIMIT 1;
