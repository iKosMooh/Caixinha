-- SCRIPT DE TESTE - SISTEMA CAIXINHA
-- Data de Referência: 07/05/2026
-- Colunas reais: barcode, name, brand, image_url, default_category

-- 1. LIMPEZA (descomente se quiser recomeçar)
-- TRUNCATE stock_movements, lots, shopping_list, consumption_predictions RESTART IDENTITY CASCADE;
-- DELETE FROM products;

-- 2. PRODUTOS
INSERT INTO products (barcode, name, brand, default_category) VALUES
('7891000100101', 'Leite Integral 1L',   'Piracanjuba', 'Laticínios'),
('7891000100202', 'Arroz Branco 5kg',    'Tio João',    'Grãos'),
('7891000100303', 'Iogurte Grego',       'Danone',      'Laticínios'),
('7891000100404', 'Peito de Frango 1kg', 'Seara',       'Carnes'),
('7891000100505', 'Café Torrado 500g',   'Melitta',     'Bebidas'),
('7891000100606', 'Macarrão Espaguete',  'Barilla',     'Massas'),
('7891000100707', 'Maionese 500g',       'Hellmanns',   'Condimentos'),
('7891000100808', 'Feijão Carioca 1kg',  'Kicaldo',     'Grãos'),
('7891000100909', 'Pão de Forma',        'Wickbold',    'Padaria')
ON CONFLICT (barcode) DO NOTHING;

-- 3. LOTES

-- A: VENCIDOS
INSERT INTO lots (product_id, location_id, qty, status, expiry_date, entered_at) VALUES
((SELECT id FROM products WHERE barcode = '7891000100303'), 2, 2, 'fechado', '2026-04-30', '2026-04-15'),
((SELECT id FROM products WHERE barcode = '7891000100909'), 1, 1, 'fechado', '2026-05-05', '2026-04-28');

-- B: VENCENDO EM BREVE (dentro de 7 dias)
INSERT INTO lots (product_id, location_id, qty, status, expiry_date, entered_at) VALUES
((SELECT id FROM products WHERE barcode = '7891000100101'), 2, 4, 'fechado', '2026-05-10', '2026-05-01'),
((SELECT id FROM products WHERE barcode = '7891000100404'), 3, 1, 'fechado', '2026-05-12', '2026-05-01');

-- C: ESTOQUE NORMAL
INSERT INTO lots (product_id, location_id, qty, status, expiry_date, entered_at) VALUES
((SELECT id FROM products WHERE barcode = '7891000100202'), 4, 2, 'fechado', '2026-12-20', '2026-05-01'),
((SELECT id FROM products WHERE barcode = '7891000100808'), 4, 5, 'fechado', '2026-10-15', '2026-05-01');

-- D: BAIXO ESTOQUE (aparece em v_low_stock pois qty <= 2)
INSERT INTO lots (product_id, location_id, qty, status, expiry_date, entered_at, opened_at) VALUES
((SELECT id FROM products WHERE barcode = '7891000100707'), 2, 1, 'aberto', '2026-06-15', '2026-04-20', '2026-05-01');

-- E: ESGOTADOS (status = acabou — não aparecem nas views de validade)
INSERT INTO lots (product_id, location_id, qty, status, expiry_date, entered_at, finished_at) VALUES
((SELECT id FROM products WHERE barcode = '7891000100505'), 1, 0, 'acabou', '2026-05-01', '2026-04-01', '2026-05-05'),
((SELECT id FROM products WHERE barcode = '7891000100606'), 4, 0, 'acabou', '2026-08-01', '2026-04-01', '2026-05-06');

-- 4. MOVIMENTAÇÕES PARA ML (histórico de consumo do Café)
INSERT INTO stock_movements (lot_id, type, qty, occurred_at) VALUES
((SELECT id FROM lots WHERE product_id = (SELECT id FROM products WHERE barcode = '7891000100505') LIMIT 1), 'in',       1, '2026-04-01'),
((SELECT id FROM lots WHERE product_id = (SELECT id FROM products WHERE barcode = '7891000100505') LIMIT 1), 'out_used', 1, '2026-04-10'),
((SELECT id FROM lots WHERE product_id = (SELECT id FROM products WHERE barcode = '7891000100505') LIMIT 1), 'out_used', 1, '2026-04-20'),
((SELECT id FROM lots WHERE product_id = (SELECT id FROM products WHERE barcode = '7891000100505') LIMIT 1), 'out_used', 1, '2026-05-05');
